
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { evaluateTest } from '../../services/geminiService';
import { notificationService } from '../../services/notificationService';
import { ApplicationStatus } from '../../types';

export const TestPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, applications, updateApplication, addToast, settings } = useStorage();
  
  const job = jobs.find(j => j.id === jobId);
  
  const application = applications.find(a => a.jobId === jobId && (a.status === ApplicationStatus.APPROVED_FOR_TEST || a.status === ApplicationStatus.TEST_COMPLETED));

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState((job?.examSettings?.duration || 30) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(application?.status === ApplicationStatus.TEST_COMPLETED);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!application) {
      navigate('/');
      return;
    }

    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [application, navigate, isFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isFinished) return;

    const questions = application?.test || [];
    if (questions.length === 0) return;

    setIsSubmitting(true);
    try {
      const evaluationPromise = evaluateTest(questions, answers);
      const evaluation = await evaluationPromise;
      
      updateApplication(application!.id, {
        status: ApplicationStatus.TEST_COMPLETED,
        testResult: {
          score: evaluation.score,
          evaluation: evaluation.evaluation,
          answers: answers
        }
      });
      
      notificationService.sendTestConfirmation(application!, job!.title, settings);
      
      setIsFinished(true);
      addToast("Assessment Submitted", 'success');
    } catch (error) {
      console.error(error);
      addToast('Error submitting test', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application || !job) return null;

  const questions = application.test || [];
  
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Assessment Not Ready</h2>
        <p className="text-slate-500 font-medium mb-10">We couldn't initialize the assessment questions. Please contact support or try applying again.</p>
        <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl">Return to Portal</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight uppercase">Submission Successful</h1>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl mb-12 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24"></div>
          
          <p className="text-slate-600 mb-8 leading-relaxed text-lg font-medium">
            Excellent work! Your technical evaluation for <strong className="text-slate-900 underline decoration-indigo-200">{job.title}</strong> has been received by our core recruitment team.
          </p>
          
          <div className="flex items-start space-x-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Confirmation Sent</h4>
              <p className="text-slate-500 text-xs mt-1 font-bold">
                A copy has been dispatched to <strong>{application.candidateInfo.email}</strong>.
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 transition-all shadow-2xl"
        >
          Back to Career Portal
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="glass-panel p-6 rounded-[2rem] border border-slate-200 mb-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl sticky top-4 z-50">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
              {currentIdx + 1}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Technical Assessment</h2>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center">Time Remaining</span>
              <div className={`px-6 py-2 rounded-xl font-mono font-black text-2xl shadow-inner ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Question Map</h4>
                <div className="grid grid-cols-5 gap-3 mb-10">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-11 h-11 rounded-[1.2rem] font-black text-sm transition-all flex items-center justify-center ${
                        currentIdx === i 
                        ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-110' 
                        : (answers[q.id] ? 'bg-indigo-50 text-indigo-400 border border-indigo-100' : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100')
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Progress</span>
                    <span className="text-[10px] font-black text-indigo-600">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(79,70,229,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-3 space-y-8 order-1 lg:order-2 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl min-h-[450px] flex flex-col">
              <div className="flex-grow">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                  {currentQuestion.type === 'mcq' ? 'Logical Selection' : 'Architecture Design'}
                </span>
                <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight mb-14 tracking-tight text-left">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.type === 'mcq' ? (
                  <div className="grid gap-5">
                    {currentQuestion.options?.map((opt, oIdx) => (
                      <label 
                        key={oIdx} 
                        className={`group flex items-center p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                          answers[currentQuestion.id] === opt 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-slate-50 hover:border-indigo-200 bg-slate-50/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          answers[currentQuestion.id] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                        }`}>
                          {answers[currentQuestion.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input 
                          type="radio" 
                          name={currentQuestion.id} 
                          value={opt} 
                          checked={answers[currentQuestion.id] === opt}
                          onChange={() => setAnswers({...answers, [currentQuestion.id]: opt})}
                          className="hidden"
                        />
                        <span className={`ml-5 text-lg font-bold transition-colors ${answers[currentQuestion.id] === opt ? 'text-indigo-900' : 'text-slate-600'}`}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    required
                    rows={8}
                    placeholder="Elaborate on your technical approach..."
                    className="w-full p-8 rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/50 text-slate-900 font-bold focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 focus:bg-white outline-none transition-all text-lg resize-none text-left"
                    value={answers[currentQuestion.id] || ''}
                    onChange={e => setAnswers({...answers, [currentQuestion.id]: e.target.value})}
                  />
                )}
              </div>
              <div className="flex justify-between items-center mt-16 pt-10 border-t border-slate-50">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all disabled:opacity-0"
                >
                  Back
                </button>
                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl"
                  >
                    Next Logic Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-16 py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.4em] hover:bg-indigo-700 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Finalizing...' : 'Final Submission'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
