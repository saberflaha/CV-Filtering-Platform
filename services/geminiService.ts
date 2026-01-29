import { GoogleGenAI, Type } from "@google/genai";
import { JobPost, ExtractedCVData, LearningRecommendation, CareerRoadmap, Application } from "../types";

/**
 * HELPER: Initialize AI client
 * Best practice: Create the instance right before the call to ensure 
 * the latest environment variables are used and to prevent startup crashes.
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("System Authorization Error: API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Parses raw resume text into a structured profile.
 */
export const parseResume = async (resumeText: string): Promise<ExtractedCVData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a senior technical recruiter. Extract the candidate's professional details from this resume text.
    
    Resume Text:
    ${resumeText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experienceYears: { type: Type.NUMBER },
          education: { type: Type.STRING },
          summary: { type: Type.STRING },
          currentTitle: { type: Type.STRING }
        },
        required: ["skills", "experienceYears", "education", "summary", "currentTitle"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a high-quality 5-phase career roadmap with real search grounding.
 */
export const generateCareerRoadmap = async (cvData: ExtractedCVData): Promise<CareerRoadmap> => {
  const ai = getAI();
  
  // STEP 1: Research Phase (Search Grounding)
  const researchResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a Jordanian HR Market Expert. Research the current 2024-2025 salary benchmarks in Amman, Jordan for this profile:
    Title: ${cvData.currentTitle}
    Experience: ${cvData.experienceYears} years
    Skills: ${cvData.skills.join(', ')}
    
    Find:
    1. Realistic annual salary range in USD (calculate based on 1 JOD = 1.41 USD).
    2. Local demand for these skills in Amman tech hubs.
    3. Certification requirements highly valued by local employers like Amazon Amman, Zain, or Orange.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const marketResearch = researchResponse.text || "No specific research data found.";
  const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

  // STEP 2: Structuring Phase (JSON mode)
  const structureResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Convert the following candidate profile and market research into a structured 5-phase career roadmap.
    
    Candidate: ${JSON.stringify(cvData)}
    Market Research: ${marketResearch}
    
    Ensure the salaryEstimate reflects the Jordanian market data provided.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentStatus: { type: Type.STRING },
          careerGoal: { type: Type.STRING },
          salaryEstimate: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              marketComment: { type: Type.STRING }
            },
            required: ["min", "max", "currency", "marketComment"]
          },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                level: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING } },
                projectIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "type", "url"]
                  }
                }
              },
              required: ["title", "level", "objectives", "skillsToAcquire", "projectIdeas", "resources"]
            }
          }
        },
        required: ["currentStatus", "careerGoal", "phases", "salaryEstimate"]
      }
    }
  });

  const roadmap: CareerRoadmap = JSON.parse(structureResponse.text || '{}');
  
  if (groundingChunks) {
    roadmap.groundingSources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));
  }

  return roadmap;
};

/**
 * Performs a deep-dive match analysis between a CV and a Job Post.
 */
export const calculateMatch = async (cvData: ExtractedCVData, job: JobPost): Promise<{ 
  score: number; 
  reasoning: string; 
  strengths: string[]; 
  skillGaps: string[]; 
  learningRecommendations: LearningRecommendation[] 
}> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform a detailed 'Hire/No-Hire' match analysis.
    
    Job Post: ${JSON.stringify(job)}
    Candidate Data: ${JSON.stringify(cvData)}
    
    Logic:
    - Compare skill overlap.
    - Validate experience years.
    - Check mandatory keywords.
    - Use 'Admin-Configured Resources' for gaps if provided: ${JSON.stringify(job.customResources || [])}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          learningRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                concept: { type: Type.STRING },
                resource: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["skill", "concept", "resource"]
            }
          }
        },
        required: ["score", "reasoning", "strengths", "skillGaps", "learningRecommendations"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates AI-based hiring recommendations for a job position.
 */
export const getHiringRecommendation = async (job: JobPost, applicants: Application[]): Promise<{
  primary: { name: string; reasoning: string; risk: string };
  alternatives: { name: string; reasoning: string; risk: string }[];
}> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a Chief Talent Officer. Analyze these applicants for the role of ${job.title}.
    
    Applicants: ${JSON.stringify(applicants.map(a => ({
      name: a.candidateInfo.fullName,
      score: a.matchScore,
      skills: a.extractedData.skills,
      exp: a.extractedData.experienceYears
    })))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primary: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              risk: { type: Type.STRING }
            },
            required: ["name", "reasoning", "risk"]
          },
          alternatives: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                risk: { type: Type.STRING }
              },
              required: ["name", "reasoning", "risk"]
            }
          }
        },
        required: ["primary", "alternatives"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a tailored technical assessment for the candidate.
 */
export const generateTechnicalTest = async (cvData: ExtractedCVData, job: JobPost) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-question technical assessment for ${cvData.fullName} for the role of ${job.title}.
    Candidate Skills: ${cvData.skills.join(', ')}.
    Difficulty: ${job.examSettings.difficulty}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING }
          },
          required: ["id", "type", "question"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

/**
 * Grades the candidate's technical assessment.
 */
export const evaluateTest = async (questions: any[], answers: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Grade this technical test.
    Questions: ${JSON.stringify(questions)}
    Answers: ${JSON.stringify(answers)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          evaluation: { type: Type.STRING }
        },
        required: ["score", "evaluation"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Identifies skills from a text description.
 */
export const extractSkillsFromDescription = async (description: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Identify top technical and soft skills from this Job Description: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};
