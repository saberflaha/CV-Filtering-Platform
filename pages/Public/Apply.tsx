
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../services/firebase';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { parseResume, calculateMatch, generateTechnicalTest } from '../../services/geminiService';
import { notificationService } from '../../services/notificationService';
import { ApplicationStatus, CandidateInfo, Application, ExtractedCVData, LearningRecommendation } from '../../types';
import { validateEmail, validatePhone, validateRequired, validateSalary } from '../../utils/validation';

// PDF.js worker setup
// Fix: Cast to any to resolve property access on global library
// @ts-ignore
const pdfjsLib: any = (window as any)['pdfjs-dist/build/pdf'];
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
}

// Mammoth for DOCX extraction
// Fix: Cast to any to resolve property access on global library
// @ts-ignore
const mammoth: any = (window as any).mammoth;

const CircularProgress: React.FC<{ score: number, threshold: number }> = ({ score, threshold }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = () => {
    if (score >= threshold) return '#10b981'; // Emerald-500
    if (score >= threshold - 15) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  return (
    <div className="relative inline-flex items-center justify-center scale-110 md:scale-125 mb-16 mt-8">
      <svg className="w-52 h-52 transform -rotate-90">
        <circle
          cx="104" cy="104" r={radius}
          stroke="#f1f5f9" strokeWidth="6" fill="transparent"
        />
        <circle
          cx="104" cy="104" r={radius}
          stroke={getColor()} strokeWidth="10" fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-[1.5s] ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
        <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter" style={{ color: getColor() }}>{animatedScore}%</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Match Rating</span>
      </div>
    </div>
  );
};

export const ApplyPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, addApplication, activeBranchId, addToast, settings } = useStorage();
  const { t } = useTranslation();
  const job = jobs.find(j => j.id === jobId);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Processing, please wait...');
  const [progress, setProgress] = useState(0);
  
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);
  
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    fullName: '', email: '', phone: '', currentSalary: '', expectedSalary: '', noticePeriod: '30 days'
  });

  const [errors, setErrors] = useState<{ [key in keyof CandidateInfo]?: string }>({});
  const [touched, setTouched] = useState<{ [key in keyof CandidateInfo]?: boolean }>({});

  const [matchResult, setMatchResult] = useState<{ 
    score: number; reasoning: string; strengths: string[]; skillGaps: string[]; learningRecommendations: LearningRecommendation[];
  } | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return 98;
          return prev + Math.floor(Math.random() * 20);
        });
      }, 300);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const validateField = (name: keyof CandidateInfo, value: string) => {
    let error = '';
    if (name === 'fullName' && !validateRequired(value)) error = 'Full name is required';
    if (name === 'email' && !validateEmail(value)) error = 'Valid email required';
    if (name === 'phone' && !validatePhone(value)) error = 'Valid phone required';
    if ((name === 'currentSalary' || name === 'expectedSalary') && value && !validateSalary(value)) error = 'Invalid amount';
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (name: keyof CandidateInfo, value: string) => {
    setCandidateInfo(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (name: keyof CandidateInfo) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, candidateInfo[name]);
  };

  const isFormValid = () => {
    const newErrors: { [key in keyof CandidateInfo]?: string } = {};
    if (!validateRequired(candidateInfo.fullName)) newErrors.fullName = 'Required';
    if (!validateEmail(candidateInfo.email)) newErrors.email = 'Invalid';
    if (!validatePhone(candidateInfo.phone)) newErrors.phone = 'Invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setCvFile(file);
    setLoadingMsg('Scanning Profile...');
    try {
      let text = '';
      const arrayBuffer = await file.arrayBuffer();
      if (file.type === 'application/pdf') {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } else if (file.name.endsWith('.docx')) {
        const res = await mammoth.extractRawText({ arrayBuffer });
        text = res.value;
      } else {
        text = await file.text();
      }
      setCvText(text);
      const parsed = await parseResume(text);
      setExtractedData(parsed);
      setCandidateInfo(prev => ({
        ...prev, 
        fullName: parsed.fullName || '', 
        email: parsed.email || '', 
        phone: parsed.phone || ''
      }));
      setStep(2);
    } catch (err) { 
      addToast("Error scanning profile", 'error');
    }
    finally { setLoading(false); }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    setLoadingMsg('Processing, please wait...');
    try {
      // 1. Calculate Match
      const match = await calculateMatch(extractedData!, job!);
      setMatchResult(match);
      const status = match.score >= job!.matchingRules.threshold ? ApplicationStatus.APPROVED_FOR_TEST : ApplicationStatus.REJECTED;
      
      // 2. Upload File to Storage
      let cvUrl = '';
      if (cvFile) {
        const fileRef = ref(storage, `cvs/${Date.now()}_${cvFile.name}`);
        const uploadResult = await uploadBytes(fileRef, cvFile);
        cvUrl = await getDownloadURL(uploadResult.ref);
      }

      // 3. Generate Test
      let testQuestions: any[] = [];
      if (status === ApplicationStatus.APPROVED_FOR_TEST && job!.examSettings.enabled) {
        testQuestions = await generateTechnicalTest(extractedData!, job!);
      }

      const newApp: Application = {
        id: Math.random().toString(36).substr(2, 9),
        jobId: job!.id, 
        branchId: activeBranchId,
        candidateInfo, 
        cvUrl: cvUrl, 
        cvContent: cvText, 
        extractedData: extractedData!,
        matchScore: match.score, 
        matchReasoning: match.reasoning,
        strengths: match.strengths, 
        skillGaps: match.skillGaps,
        learningRecommendations: match.learningRecommendations,
        status, 
        test: testQuestions, 
        appliedAt: Date.now(),
        archived: false,
        version: 1
      };

      await addApplication(newApp);
      await notificationService.sendApplicationConfirmation(newApp, job!.title, settings);
      setStep(3);
    } catch (error) { 
      console.error(error);
      addToast("Error calculating alignment", 'error');
    }
    finally { setLoading(false); }
  };

  if (!job) return <div className="p-20 text-center uppercase font-black text-xs">Requisition not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 text-left">
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-2xl z-[150] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="relative w-24 h-24 mb-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="44" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
              <circle cx="48" cy="48" r="44" stroke="#6366f1" strokeWidth="6" fill="transparent" strokeDasharray="276.4" strokeDashoffset={276.4 - (progress / 100) * 276.4} strokeLinecap="round" className="transition-all duration-300" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-slate-900 font-black text-lg">{progress}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 text-center">{loadingMsg}</h2>
        </div>
      )}

      {step < 3 && (
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">{job.title}</h1>
        </div>
      )}

      <div className="glass-panel rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        {step === 1 && (
          <div className="p-12 md:p-24 border-4 border-dashed border-slate-200 rounded-[3rem] text-center bg-slate-50/50 hover:border-indigo-500 transition-all group">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl border border-slate-100">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Submit Profile</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">PDF/DOCX required for system extraction.</p>
            <input type="file" id="cv-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
            <label htmlFor="cv-upload" className="bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 cursor-pointer shadow-2xl transition-all">
              Upload Resume
            </label>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleInfoSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b pb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Information Check</h3>
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">STEP 2 OF 3</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Name</label>
                <input required className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" value={candidateInfo.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Email</label>
                <input required type="email" className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" value={candidateInfo.email} onChange={e => handleInputChange('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Phone</label>
                <input required className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" value={candidateInfo.phone} onChange={e => handleInputChange('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Current Salary</label>
                <input className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" placeholder="e.g. 50k" value={candidateInfo.currentSalary} onChange={e => handleInputChange('currentSalary', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Expected Salary</label>
                <input className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" placeholder="e.g. 65k" value={candidateInfo.expectedSalary} onChange={e => handleInputChange('expectedSalary', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mx-2">Notice Period</label>
                <input className="w-full px-5 py-4 rounded-2xl border bg-white text-slate-900 focus:ring-4 outline-none transition-all shadow-sm font-bold text-sm text-left border-slate-200" value={candidateInfo.noticePeriod} onChange={e => handleInputChange('noticePeriod', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/')} className="flex-1 py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-widest text-slate-400 border border-slate-200 hover:bg-slate-100 transition-colors">Close</button>
              <button type="submit" className="flex-[2] bg-indigo-600 text-white py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] hover:scale-[1.02] shadow-2xl transition-all">Proceed to Evaluation</button>
            </div>
          </form>
        )}

        {step === 3 && matchResult && (
          <div className="space-y-12 animate-in slide-in-from-bottom-6">
            <div className="flex flex-col items-center text-center">
              <CircularProgress score={matchResult.score} threshold={job.matchingRules.threshold} />
              <h3 className="text-4xl font-black mt-8 text-slate-900 uppercase tracking-tighter">
                {matchResult.score >= job.matchingRules.threshold ? 'QUALIFIED' : 'REVIEW PENDING'}
              </h3>
              <p className="text-slate-500 mt-4 max-w-lg font-medium leading-relaxed">
                {matchResult.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100">
                <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center">
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  Strengths & Matches
                </h4>
                <ul className="space-y-3">
                  {matchResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 italic">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100">
                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center">
                  <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Skills to Develop
                </h4>
                <ul className="space-y-3">
                  {matchResult.skillGaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700 italic">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {matchResult.learningRecommendations.length > 0 && (
              <div className="space-y-6 text-center">
                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em]">{t('jobs.learningPath')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchResult.learningRecommendations.map((rec, i) => (
                    <a 
                      key={i} 
                      href={rec.url || '#'} 
                      target={rec.url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all hover:shadow-lg flex flex-col text-left"
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{rec.skill}</span>
                      <h5 className="font-black text-slate-900 leading-tight mb-2 uppercase">{rec.concept}</h5>
                      <p className="text-xs text-slate-500 font-medium mb-4 flex-grow">{rec.resource}</p>
                      {rec.url && (
                        <div className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          Access Material <svg className="w-3 h-3 mx-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 mb-8 font-medium italic">A confirmation of your application has been dispatched to your email address.</p>
              <button 
                onClick={() => navigate(matchResult.score >= job.matchingRules.threshold ? `/test/${jobId}` : '/')} 
                className="w-full max-w-md bg-indigo-600 text-white py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-700 shadow-2xl transition-all"
              >
                {matchResult.score >= job.matchingRules.threshold ? 'Launch Assessment' : 'Back to Portal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
