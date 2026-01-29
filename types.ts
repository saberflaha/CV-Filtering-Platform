
export enum Language {
  EN = 'en',
  AR = 'ar'
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
}

export enum ExperienceLevel {
  ENTRY = 'Entry Level',
  MID = 'Mid Level',
  SENIOR = 'Senior Level',
  LEAD = 'Lead/Director',
}

export enum EducationLevel {
  NONE = 'No degree required',
  HIGH_SCHOOL = 'High School',
  BACHELORS = 'Bachelor\'s Degree',
  MASTERS = 'Master\'s Degree',
  PHD = 'PhD / Doctorate',
}

export interface Branch {
  id: string;
  name: string;
  companyName: string;
  createdAt: number;
}

// RBAC Structures
export type PermissionAction = 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'EXECUTE' | 'EXPORT';

export interface ModulePermissions {
  moduleId: string;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: ModulePermissions[];
  isSystem?: boolean; // System roles cannot be deleted
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  position: string;
  phone: string;
  role: 'super' | 'admin'; // Keeping legacy for compatibility
  roleId: string; // New: linking to the specific dynamic role
  branchId: string;
  createdAt: number;
}

export interface AppSettings {
  emailjsPublicKey: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
}

export interface MatchingRules {
  skillWeight: number;
  experienceWeight: number;
  educationWeight: number;
  keywordsWeight: number;
  threshold: number;
}

export interface ExamSettings {
  enabled: boolean;
  duration: number;
  questionCount: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CustomResource {
  skill: string;
  title: string;
  url: string;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED_FOR_TEST = 'APPROVED_FOR_TEST',
  TEST_COMPLETED = 'TEST_COMPLETED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  OFFER_SENT = 'OFFER_SENT',
  HIRED = 'HIRED'
}

export interface JobPost {
  id: string;
  branchId: string;
  title: string;
  department: string;
  location: string;
  description: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  requiredSkills: string[];
  minYearsExperience: number;
  requiredEducationLevel: EducationLevel;
  keywords: string[];
  matchingRules: MatchingRules;
  examSettings: ExamSettings;
  customResources: CustomResource[];
  status: JobStatus;
  archived: boolean;
  createdAt: number;
}

export interface CandidateInfo {
  fullName: string;
  email: string;
  phone: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  source?: string;
}

export interface LearningRecommendation {
  skill: string;
  concept: string;
  resource: string;
  url?: string;
}

export interface ExtractedCVData {
  fullName?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  education: string;
  summary: string;
  currentTitle: string;
}

export interface CareerPhase {
  title: string;
  level: string;
  objectives: string[];
  skillsToAcquire: string[];
  projectIdeas: string[];
  resources: {
    title: string;
    type: 'Course' | 'Article' | 'Book';
    url: string;
  }[];
}

export interface SalaryEstimate {
  min: number;
  max: number;
  currency: string;
  marketComment: string;
}

export interface CareerRoadmap {
  currentStatus: string;
  careerGoal: string;
  phases: CareerPhase[];
  salaryEstimate?: SalaryEstimate;
  groundingSources?: { title: string; uri: string }[];
}

export interface Question {
  id: string;
  type: 'mcq' | 'text';
  question: string;
  options?: string[];
  correctAnswer?: string;
}

export interface TestResult {
  score: number;
  evaluation: string;
  answers: { [questionId: string]: string };
}

export interface Application {
  id: string;
  jobId: string;
  branchId: string;
  candidateInfo: CandidateInfo;
  cvUrl: string;
  cvContent: string;
  extractedData: ExtractedCVData;
  matchScore: number;
  matchReasoning: string;
  strengths: string[];
  skillGaps: string[];
  learningRecommendations: LearningRecommendation[];
  status: ApplicationStatus;
  test?: Question[];
  testResult?: TestResult;
  roadmap?: CareerRoadmap;
  archived: boolean;
  version: number;
  appliedAt: number;
  hiredAt?: number;
  lastEmailType?: 'test' | 'interview' | 'rejection';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'test_complete' | 'new_app' | 'info';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
