
import React, { useState } from 'react';
import { parseResume, generateCareerRoadmap } from '../../services/geminiService';
import { ExtractedCVData, CareerRoadmap, Application } from '../../types';
import { useStorage } from '../../hooks/useStorage';

// PDF.js worker setup
// Fix: Cast to any to resolve property access on global library
// @ts-ignore
const pdfjsLib: any = (window as any)['pdfjs-dist/build/pdf'];
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Mammoth for DOCX extraction
// Fix: Cast to any to resolve property access on global library
// @ts-ignore
const mammoth: any = (window as any).mammoth;

export const CareerPath: React.FC = () => {
  const { applications, updateApplication } = useStorage();
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [cvData, setCvData] = useState<ExtractedCVData | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setLoadingMsg('Analyzing professional documentation...');
    setRoadmap(null);
    setIsSaved(false);

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

      setLoadingMsg('Structuring profile for Jordan...');
      const parsed = await parseResume(text);
      setCvData(parsed);

      setLoadingMsg('Benchmarking local salary & roadmap...');
      const generatedRoadmap = await generateCareerRoadmap(parsed);
      setRoadmap(generatedRoadmap);
    } catch (err) {
      alert("Error generating roadmap. Please try a different profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExistingApplicant = async () => {
    const app = applications.find(a => a.id === selectedAppId);
    if (!app) return;

    setLoading(true);
    setLoadingMsg(`Benchmarking ${app.candidateInfo.fullName} against Jordanian standards...`);
    setRoadmap(null);
    setIsSaved(false);

    try {
      setCvData(app.extractedData);
      const generatedRoadmap = await generateCareerRoadmap(app.extractedData);
      setRoadmap(generatedRoadmap);
    } catch (err) {
      alert("Error generating roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const saveToCandidate = () => {
    if (selectedAppId && roadmap) {
      updateApplication(selectedAppId, { roadmap });
      setIsSaved(true);
    }
  };

  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="mb-20 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[11px] tracking-[0.5em] mb-4 block">JORDAN TECH ECOSYSTEM ANALYSIS</span>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 leading-none">Market <span className="text-indigo-600">Oracle</span></h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
          Highly accurate salary benchmarking and 5-phase career trajectories designed exclusively for the <span className="text-slate-900 dark:text-white font-bold">Jordanian Tech Market</span>.
        </p>
      </header>

      {!roadmap && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in fade-in duration-1000">
          <div className="p-16 glass-panel rounded-[3rem] text-center group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-700 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 group-hover:via-indigo-500/5 transition-all"></div>
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative z-10">
              <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter relative z-10">Process Profile</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-base relative z-10">Scan any CV to reveal precise local market value and growth path.</p>
            <input type="file" id="cv-career" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
            <label htmlFor="cv-career" className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 cursor-pointer shadow-2xl transition-all inline-block relative z-10">
              Upload CV
            </label>
          </div>

          <div className="p-16 glass-panel rounded-[3rem] text-center flex flex-col items-center group transition-all duration-700 shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover:via-amber-500/5 transition-all"></div>
            <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg group-hover:scale-110 transition-all duration-700 relative z-10">
              <svg className="w-12 h-12 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter relative z-10">Internal Analysis</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium text-base relative z-10">Select an existing candidate to calculate Jordanian market fit.</p>
            <select 
              className="w-full max-w-sm mb-8 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xs tracking-[0.1em] outline-none focus:ring-4 focus:ring-amber-500/10 transition-all relative z-10"
              value={selectedAppId}
              onChange={e => setSelectedAppId(e.target.value)}
            >
              <option value="">Select Candidate...</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>{app.candidateInfo.fullName}</option>
              ))}
            </select>
            <button 
              onClick={handleExistingApplicant}
              disabled={!selectedAppId}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all shadow-2xl disabled:opacity-20 disabled:pointer-events-none relative z-10"
            >
              Benchmark Profile
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-32 text-center animate-in fade-in duration-700">
          <div className="relative w-32 h-32 mx-auto mb-12">
            <div className="absolute inset-0 border-8 border-indigo-600/10 dark:border-indigo-900/10 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">{loadingMsg}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[11px] tracking-[0.5em] animate-pulse">Syncing Local Economic Data...</p>
        </div>
      )}

      {roadmap && (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
          <div className="bg-indigo-600 dark:bg-indigo-900 p-10 md:p-16 rounded-[3.5rem] mb-12 text-white border-b-[12px] border-indigo-500 dark:border-indigo-800 shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10 text-left">
              <div>
                <span className="text-indigo-100 dark:text-indigo-300 font-black uppercase text-[10px] tracking-[0.5em]">DESTINY OVERVIEW</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-4 leading-none">{cvData?.fullName}</h2>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="bg-white/10 px-8 py-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                  <span className="block text-[10px] font-black uppercase text-indigo-100 dark:text-indigo-300 mb-2 tracking-widest">JORDANIAN BASELINE</span>
                  <span className="font-bold text-lg uppercase tracking-tight">{roadmap.currentStatus}</span>
                </div>
                <div className="bg-slate-900 dark:bg-black px-10 py-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/10">
                  <span className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2 tracking-widest">GOAL HUB</span>
                  <span className="font-bold text-lg uppercase tracking-tight">{roadmap.careerGoal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Precision Local Salary Benchmark */}
          {roadmap.salaryEstimate && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 mb-20 shadow-xl transition-all hover:shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-12">
                <div className="flex-shrink-0 bg-emerald-500/10 dark:bg-emerald-500/20 p-8 rounded-[2.5rem] border border-emerald-500/20 text-center min-w-[320px]">
                  <span className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4">JORDAN MARKET INDEX</span>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {formatCurrency(roadmap.salaryEstimate.min, roadmap.salaryEstimate.currency)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600 font-black text-lg">—</span>
                    <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {formatCurrency(roadmap.salaryEstimate.max, roadmap.salaryEstimate.currency)}
                    </span>
                  </div>
                  <span className="block mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Precision Benchmark (2024-2025 Amman Tech Hub)</span>
                </div>
                
                <div className="flex-grow">
                  <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Jordanian Market Rationale
                  </h4>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                    "{roadmap.salaryEstimate.marketComment}"
                  </p>
                  <div className="mt-8 flex gap-4">
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">100% Jordan Focus</span>
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Amman Pay Scales</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-32 px-4 md:px-0">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 dark:bg-slate-800 transform md:-translate-x-1/2 rounded-full"></div>
            <div className="space-y-32 relative text-left">
              {roadmap.phases.map((phase, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-16 md:gap-0 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="w-full md:w-[45%] animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 200}ms` }}>
                    <div className="glass-panel p-10 md:p-14 rounded-[3.5rem] shadow-xl group hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 text-8xl font-black text-slate-100 dark:text-slate-800/50 pointer-events-none select-none italic transition-transform group-hover:scale-110 group-hover:-translate-y-2">0{idx + 1}</div>
                      <span className="inline-block px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-indigo-100 dark:border-indigo-800/50">
                        {phase.level}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{phase.title}</h3>
                      
                      <div className="space-y-12">
                        <section>
                          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">LOCAL GROWTH MILESTONES</h4>
                          <ul className="space-y-4">
                            {phase.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 transition-colors">
                                <span className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full mt-1.5 mr-5 flex-shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </section>
                        
                        <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-colors">
                          <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6">JORDANIAN SKILL PATH</h4>
                          <div className="space-y-4">
                            {phase.resources.map((res, i) => (
                              <a 
                                key={i} href={res.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:scale-[1.02] transition-all shadow-sm group/link hover:border-indigo-500 dark:hover:border-indigo-400"
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px] mb-1">{res.title}</span>
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{res.type}</span>
                                </div>
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 opacity-50 group-hover/link:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-20 h-20 bg-indigo-600 dark:bg-indigo-500 rounded-[1.5rem] border-[8px] border-slate-50 dark:border-slate-950 shadow-2xl flex items-center justify-center z-10 scale-125 relative transition-colors">
                    <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-400 rounded-[1.5rem] animate-ping opacity-10"></div>
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  
                  <div className="hidden md:block w-[45%]"></div>
                </div>
              ))}
            </div>
          </div>

          {roadmap.groundingSources && roadmap.groundingSources.length > 0 && (
            <div className="mt-16 p-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] animate-in fade-in duration-700 text-left transition-colors">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Market Verification Sources</h4>
              <div className="flex flex-wrap gap-4">
                {roadmap.groundingSources.map((source, sIdx) => (
                  <a 
                    key={sIdx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 pb-16">
            <button 
              onClick={() => { setRoadmap(null); setCvData(null); setIsSaved(false); setSelectedAppId(''); }}
              className="w-full md:w-auto px-16 py-6 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              Analyze New Profile
            </button>
            {selectedAppId && !isSaved && (
              <button 
                onClick={saveToCandidate}
                className="w-full md:w-auto px-16 py-6 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-indigo-700 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all"
              >
                Lock Development Path
              </button>
            )}
            {isSaved && (
              <div className="bg-emerald-500/10 text-emerald-600 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] border border-emerald-500/20 animate-in zoom-in-95 duration-200">
                Jordan Benchmark Locked
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
