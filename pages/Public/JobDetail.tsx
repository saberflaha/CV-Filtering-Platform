
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { JobStatus } from '../../types';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs } = useStorage();
  const { t } = useTranslation();
  
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Role Not Found</h1>
        <button 
          onClick={() => navigate('/')}
          className="btn-premium bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest"
        >
          {t('portal.backToPortal')}
        </button>
      </div>
    );
  }

  const isClosed = job.status === JobStatus.CLOSED;
  const isArchived = job.archived;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 text-left">
      <div className="mb-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-black uppercase text-[10px] tracking-widest group"
        >
          <svg className="w-4 h-4 mr-2 rtl:rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {t('portal.backToPortal')}
        </Link>
      </div>

      <div className="glass-panel rounded-[3rem] p-10 md:p-16 border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-fade-in-up">
        {isArchived && (
          <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-400 font-bold text-center">
            {t('portal.jobArchived')}
          </div>
        )}
        
        {isClosed && !isArchived && (
          <div className="mb-10 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 font-bold text-center">
            {t('portal.jobClosed')}
          </div>
        )}

        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-5 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
              {job.department}
            </span>
            <span className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
              {job.experienceLevel}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-8">
            {job.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              </div>
              {job.location}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              {job.type}
            </div>
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-16">
          <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-6">About the Role</h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
            {job.description}
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-6">Required Skill Stack</h3>
          <div className="flex flex-wrap gap-3">
            {job.requiredSkills.map((skill, i) => (
              <span key={i} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 shadow-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {!isClosed && !isArchived && (
          <div className="flex justify-center pt-10 border-t border-slate-100 dark:border-slate-800">
            <Link 
              to={`/apply/${job.id}`}
              className="btn-premium w-full md:w-auto bg-indigo-600 text-white px-16 py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-indigo-600/20 text-center"
            >
              {t('portal.applyNow')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
