
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { JobStatus } from '../../types';

export const PublicPortal: React.FC = () => {
  const { jobs } = useStorage();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => 
      j.status === JobStatus.OPEN && 
      !j.archived &&
      (j.title.toLowerCase().includes(filter.toLowerCase()) || 
       j.department.toLowerCase().includes(filter.toLowerCase()) ||
       j.location.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [jobs, filter]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 animate-fade-in-up">
      {/* Hero Section - Reduced Title Sizes for Consistency */}
      <div className="relative mb-16 md:mb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative text-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-8 animate-float">
              <span className="text-white font-black text-2xl md:text-3xl tracking-tighter">HR</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-2 px-4">
              {t('portal.heroTitle1')} <span className="text-indigo-600">{t('portal.heroTitle2')}</span>
            </h1>
            {/* Removed the sub-description as requested */}
          </div>
          <div className="max-w-2xl mx-auto relative group px-6">
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[2rem] px-6 md:px-8 py-4 md:py-5 shadow-xl transition-all group-focus-within:ring-8 group-focus-within:ring-indigo-500/5 group-focus-within:border-indigo-500">
              <input 
                type="text" 
                placeholder={t('portal.searchPlaceholder')} 
                className="bg-transparent border-none outline-none w-full text-lg md:text-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-400 tracking-tight"
                value={filter}
                onChange={handleSearch}
              />
              <svg className="w-6 h-6 text-indigo-600 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Role Grid */}
      <div className="grid gap-10 md:gap-14 text-left">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mx-4 shrink-0">
            {t('portal.activeOpportunities')} ({filteredJobs.length})
          </h2>
          <div className="h-[1px] flex-grow mx-6 bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {paginatedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {paginatedJobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden animate-fade-in-up"
              >
                <div className="relative flex flex-col h-full justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50">
                        {job.department}
                      </span>
                      <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                        {job.experienceLevel}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight mb-6 leading-tight">
                      {job.title}
                    </h3>
                    <div className="flex flex-col gap-3 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        {job.location}
                      </div>
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {job.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to={`/job/${job.id}`}
                      className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm text-center hover:border-indigo-600 transition-all"
                    >
                      {t('portal.viewJob')}
                    </Link>
                    <Link 
                      to={`/apply/${job.id}`}
                      className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 text-center hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      {t('portal.applyNow')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800 px-10 shadow-sm">
            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{t('portal.noMatching')}</h4>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">{t('portal.refine')}</p>
          </div>
        )}
      </div>

      {/* Standardized Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 py-16">
          <button 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 rtl:rotate-180 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-xs transition-all border ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
            className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 rtl:rotate-180 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};
