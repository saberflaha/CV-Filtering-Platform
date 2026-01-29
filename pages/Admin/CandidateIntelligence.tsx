
import React, { useState, useMemo } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { Application, JobPost } from '../../types';
import { getHiringRecommendation } from '../../services/geminiService';

interface RankingWeights {
  skills: number;
  salary: number;
  experience: number;
  availability: number;
}

export const CandidateIntelligence: React.FC = () => {
  const { applications, jobs } = useStorage();
  const { t } = useTranslation();
  
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [weights, setWeights] = useState<RankingWeights>({
    skills: 50,
    salary: 20,
    experience: 20,
    availability: 10
  });

  const [aiRec, setAiRec] = useState<{
    primary: { name: string; reasoning: string; risk: string };
    alternatives: { name: string; reasoning: string; risk: string }[];
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const jobApplicants = applications.filter(a => a.jobId === selectedJobId && !a.archived);

  // Intelligent Ranking Logic
  const rankedApplicants = useMemo(() => {
    if (!selectedJob) return [];

    return [...jobApplicants].map(app => {
      // Calculate normalized factors (0 to 1)
      const skillFactor = app.matchScore / 100;
      const expFactor = Math.min(app.extractedData.experienceYears / (selectedJob.minYearsExperience || 1), 1.2);
      
      // Salary factor: 1 if within range, decreases if over budget
      let salaryFactor = 1;
      const expected = parseFloat(app.candidateInfo.expectedSalary.replace(/[^0-9.]/g, '')) || 0;
      // Use benchmark as budget if exists, otherwise a generic logic
      const budget = selectedJob.matchingRules.threshold > 0 ? 3000 : 2000; // Mock threshold-based logic
      if (expected > budget) {
        salaryFactor = Math.max(0, 1 - ((expected - budget) / budget));
      }

      // Availability factor: mock logic based on common strings
      let availFactor = 0.5;
      const np = app.candidateInfo.noticePeriod.toLowerCase();
      if (np.includes('immediate') || np.includes('0 days') || np.includes('now')) availFactor = 1;
      else if (np.includes('15 days') || np.includes('2 weeks')) availFactor = 0.8;
      else if (np.includes('30 days') || np.includes('1 month')) availFactor = 0.6;

      // Weighted Intelligence Score
      const totalScore = (
        (skillFactor * weights.skills) +
        (salaryFactor * weights.salary) +
        (expFactor * weights.experience) +
        (availFactor * weights.availability)
      );

      // Determine Fit & Risk Indicators
      const fitStatus = app.matchScore >= 80 ? 'High' : app.matchScore >= 60 ? 'Medium' : 'Low';
      let riskLevel = 'Low';
      if (app.matchScore < 50 || salaryFactor < 0.6) riskLevel = 'High';
      else if (app.matchScore < 70 || salaryFactor < 0.8) riskLevel = 'Medium';

      return {
        ...app,
        intelligenceScore: Math.round(totalScore),
        fitStatus,
        riskLevel,
        salaryAlignment: Math.round(salaryFactor * 100)
      };
    }).sort((a, b) => b.intelligenceScore - a.intelligenceScore);
  }, [jobApplicants, selectedJob, weights]);

  const handleAiRecommendation = async () => {
    if (!selectedJob || jobApplicants.length === 0) return;
    setIsAiLoading(true);
    setAiRec(null);
    try {
      const rec = await getHiringRecommendation(selectedJob, jobApplicants);
      setAiRec(rec);
    } catch (error) {
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade-in-up">
      <header className="mb-12 text-left">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{t('intelligence.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('intelligence.sub')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* Job Selector Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('intelligence.selectJob')}</label>
            <select 
              className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
              value={selectedJobId}
              onChange={e => { setSelectedJobId(e.target.value); setAiRec(null); }}
            >
              <option value="">Choose Position...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('intelligence.rankingWeights')} (%)</h4>
            <div className="space-y-6">
              {Object.keys(weights).map((key) => (
                <div key={key}>
                  <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                    <span className="text-slate-500">{key}</span>
                    <span className="text-indigo-600">{(weights as any)[key]}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    value={(weights as any)[key]}
                    onChange={e => setWeights({...weights, [key]: parseInt(e.target.value)})}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Analysis View */}
        <div className="lg:col-span-3 space-y-8">
          {selectedJobId ? (
            <>
              {jobApplicants.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full"></div>
                    <div className="relative z-10 text-left">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{selectedJob?.title}</h3>
                      <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{jobApplicants.length} Intelligence Records Found</p>
                    </div>
                    <button 
                      onClick={handleAiRecommendation}
                      disabled={isAiLoading}
                      className="relative z-10 btn-premium bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isAiLoading ? t('intelligence.loadingAI') : t('intelligence.recommendButton')}
                    </button>
                  </div>

                  {/* AI Recommendation Modal Style Panel */}
                  {aiRec && (
                    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/20 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 text-left relative overflow-hidden">
                       <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-bl-3xl">AI Report Active</div>
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 border-b border-slate-100 dark:border-slate-800 pb-6">{t('intelligence.hiringReport')}</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="md:col-span-2 space-y-8">
                           <div className="p-8 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50">
                             <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 block">{t('intelligence.primaryRec')}</span>
                             <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-4">{aiRec.primary.name}</h4>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{aiRec.primary.reasoning}"</p>
                             <div className="mt-6 pt-6 border-t border-indigo-100 dark:border-indigo-900/50">
                               <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">{t('intelligence.risks')}</p>
                               <p className="text-xs font-bold text-slate-500">{aiRec.primary.risk}</p>
                             </div>
                           </div>
                         </div>
                         <div className="space-y-6">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{t('intelligence.alternatives')}</span>
                           {aiRec.alternatives.map((alt, i) => (
                             <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                               <h5 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-2">{alt.name}</h5>
                               <p className="text-[10px] text-slate-500 leading-tight mb-3 line-clamp-2">{alt.reasoning}</p>
                               <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Trade-off: {alt.risk.split('.')[0]}</span>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* Ranked Candidate Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-8 py-6">Identity & Rank</th>
                            <th className="px-8 py-6 text-center">{t('intelligence.fit')}</th>
                            <th className="px-8 py-6 text-center">{t('intelligence.risk')}</th>
                            <th className="px-8 py-6 text-center">{t('intelligence.salaryAlignment')}</th>
                            <th className="px-8 py-6 text-right">Intel Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {rankedApplicants.map((app, idx) => (
                            <tr key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                              <td className="px-8 py-8">
                                <div className="flex items-center gap-5">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{app.candidateInfo.fullName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{app.extractedData.experienceYears}Y • {app.candidateInfo.noticePeriod.slice(0, 15)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-8 text-center">
                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${app.fitStatus === 'High' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : app.fitStatus === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' : 'text-red-600 bg-red-50 dark:bg-red-950/20'}`}>
                                  {app.fitStatus}
                                </span>
                              </td>
                              <td className="px-8 py-8 text-center">
                                <span className={`px-4 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getRiskColor(app.riskLevel)}`}>
                                  {app.riskLevel}
                                </span>
                              </td>
                              <td className="px-8 py-8 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-sm font-black text-slate-900 dark:text-white">{app.salaryAlignment}%</span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase">{app.candidateInfo.expectedSalary}</span>
                                </div>
                              </td>
                              <td className="px-8 py-8 text-right">
                                <div className="text-2xl font-black text-indigo-600 tracking-tighter">{app.intelligenceScore}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-32 glass-panel rounded-[3rem] border-dashed border-2 text-center">
                  <p className="text-slate-500 font-bold uppercase tracking-widest">{t('intelligence.noApplicants')}</p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center py-40 glass-panel rounded-[3rem] border-dashed border-2">
              <div className="text-center opacity-40">
                <svg className="w-20 h-20 mx-auto mb-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p className="font-black uppercase tracking-[0.3em] text-slate-400">{t('intelligence.selectJob')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
