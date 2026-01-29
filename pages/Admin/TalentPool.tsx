
import React, { useState, useMemo, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { Application, ApplicationStatus, ExperienceLevel } from '../../types';
import { notificationService } from '../../services/notificationService';

interface Filters {
  searchTerm: string;
  jobId: string;
  department: string;
  experienceLevel: ExperienceLevel | 'All';
  status: ApplicationStatus | 'All';
  showArchived: boolean;
}

export const TalentPool: React.FC = () => {
  const { applications, jobs, updateApplication, addNotification, addToast, settings } = useStorage();
  const { t } = useTranslation();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewData, setInterviewData] = useState({ date: '', notes: '' });
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');

  const itemsPerPage = 6;

  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedApp]);

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    jobId: 'All',
    department: 'All',
    experienceLevel: 'All',
    status: 'All',
    showArchived: false
  });

  const departments = useMemo(() => Array.from(new Set(jobs.map(j => j.department))) as string[], [jobs]);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const job = jobs.find(j => j.id === app.jobId);
      const matchesSearch = !filters.searchTerm || 
        app.candidateInfo.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.extractedData.skills.some(s => s.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        app.extractedData.currentTitle.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesJob = filters.jobId === 'All' || app.jobId === filters.jobId;
      const matchesDept = filters.department === 'All' || job?.department === filters.department;
      const matchesExp = filters.experienceLevel === 'All' || job?.experienceLevel === filters.experienceLevel;
      const matchesStatus = filters.status === 'All' || app.status === filters.status;
      const matchesArchived = filters.showArchived ? app.archived : !app.archived;

      return matchesSearch && matchesJob && matchesDept && matchesExp && matchesStatus && matchesArchived;
    });
  }, [applications, filters, jobs]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleArchive = (app: Application) => {
    updateApplication(app.id, { archived: !app.archived });
    addToast(app.archived ? "Record Restored" : "Record Archived", 'info');
  };

  const handleSendTest = async (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return;
    setIsProcessing(true);
    try {
      const res = await notificationService.sendTestInvitation(app, job.title, settings);
      if (res.success) {
        updateApplication(app.id, { status: ApplicationStatus.APPROVED_FOR_TEST, lastEmailType: 'test' });
        addNotification({
          title: 'Assessment Sent',
          message: `Technical test dispatched to ${app.candidateInfo.fullName}`,
          type: 'info'
        });
        addToast("Technical Test Email Sent Successfully", 'success');
      } else {
        addToast('Dispatch Error: ' + res.error, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendInterview = async (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    if (!job || !interviewData.date) return;
    setIsProcessing(true);
    try {
      const res = await notificationService.sendInterviewInvitation(app, job.title, interviewData.date, settings, interviewData.notes);
      if (res.success) {
        updateApplication(app.id, { status: ApplicationStatus.INTERVIEW_SCHEDULED, lastEmailType: 'interview' });
        addNotification({
          title: 'Interview Scheduled',
          message: `Meeting set for ${app.candidateInfo.fullName} on ${interviewData.date}`,
          type: 'info'
        });
        addToast("Interview Invitation Dispatched", 'success');
        setShowInterviewForm(false);
      } else {
        addToast('Dispatch Error: ' + res.error, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateRejection = (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    const defaultMsg = `Dear ${app.candidateInfo.fullName},\n\nThank you for your interest in the ${job?.title || 'position'} role. After careful review, we have decided to proceed with other candidates whose profiles more closely match our current requirements.\n\nWe will retain your information in our talent pool for future opportunities.\n\nBest regards,\nThe Recruitment Team`;
    setRejectionMessage(defaultMsg);
    setShowRejectionForm(true);
  };

  const handleSendRejection = async (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return;
    setIsProcessing(true);
    try {
      const res = await notificationService.sendEmail({
        to_email: app.candidateInfo.email,
        from_name: 'HR Platform Careers',
        subject: `Application Status: ${job.title}`,
        message: rejectionMessage,
        candidate_name: app.candidateInfo.fullName,
        job_title: job.title
      }, settings);
      
      if (res.success) {
        updateApplication(app.id, { status: ApplicationStatus.REJECTED, lastEmailType: 'rejection' });
        addToast("Rejection Notice Dispatched", 'success');
        setShowRejectionForm(false);
      } else {
        addToast('Dispatch Error: ' + res.error, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case ApplicationStatus.HIRED: return 'bg-emerald-100 text-emerald-700';
      case ApplicationStatus.REJECTED: return 'bg-red-100 text-red-600';
      case ApplicationStatus.INTERVIEW_SCHEDULED: return 'bg-blue-100 text-blue-700';
      case ApplicationStatus.APPROVED_FOR_TEST: return 'bg-purple-100 text-purple-700';
      case ApplicationStatus.TEST_COMPLETED: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('talentPool.title')}</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">{t('talentPool.sub')}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
           <button 
            onClick={() => setFilters({...filters, showArchived: !filters.showArchived})}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 border rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${filters.showArchived ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            <span className="hidden sm:inline">{filters.showArchived ? t('talentPool.activeVault') : t('talentPool.archives')}</span>
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            {t('talentPool.filters')}
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-12 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('talentPool.searchKeywords')}</label>
              <input type="text" placeholder={t('talentPool.searchPlaceholder')} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white" value={filters.searchTerm} onChange={e => { setFilters({...filters, searchTerm: e.target.value}); setCurrentPage(1); }} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('talentPool.position')}</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white" value={filters.jobId} onChange={e => { setFilters({...filters, jobId: e.target.value}); setCurrentPage(1); }}>
                <option value="All">{t('talentPool.allRoles')}</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('talentPool.department')}</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white" value={filters.department} onChange={e => { setFilters({...filters, department: e.target.value}); setCurrentPage(1); }}>
                <option value="All">{t('talentPool.allDepts')}</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('talentPool.seniority')}</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white" value={filters.experienceLevel} onChange={e => { setFilters({...filters, experienceLevel: e.target.value as any}); setCurrentPage(1); }}>
                <option value="All">{t('talentPool.allLevels')}</option>
                {Object.values(ExperienceLevel).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('talentPool.workflowStatus')}</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white" value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value as any}); setCurrentPage(1); }}>
                <option value="All">{t('talentPool.allStatus')}</option>
                {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 text-left">
        {paginatedApps.map(app => (
          <div key={app.id} className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-xl group-hover:scale-110 transition-transform">
                  {app.candidateInfo.fullName[0]}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-wider ${getStatusColor(app.status)}`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">v{app.version || 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleArchive(app); }} className="text-[8px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      {app.archived ? 'REST' : 'ARCH'}
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 md:mb-2 truncate">{app.candidateInfo.fullName}</h3>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold mb-6 uppercase tracking-widest truncate">{app.extractedData.currentTitle}</p>
              <div className="grid grid-cols-2 gap-3 mb-6 md:mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('talentPool.matchScore')}</span>
                  <span className="text-base md:text-lg font-black text-indigo-600">{app.matchScore}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t('talentPool.experience')}</span>
                  <span className="text-base md:text-lg font-black text-slate-900 dark:text-white">{app.extractedData.experienceYears}Y</span>
                </div>
              </div>
              <button onClick={() => setSelectedApp(app)} className="w-full py-3.5 md:py-4 bg-slate-100 dark:bg-slate-800 dark:text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                {t('talentPool.profile')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 md:gap-4 py-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-3 md:p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl disabled:opacity-20 hover:bg-slate-50 transition-all">
            <svg className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div className="flex gap-1 md:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-2xl font-black text-[10px] md:text-xs transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                {page}
              </button>
            ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="p-3 md:p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl disabled:opacity-20 hover:bg-slate-50 transition-all">
            <svg className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full h-full sm:h-auto sm:max-w-5xl sm:rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-screen sm:max-h-[94vh] flex flex-col border border-slate-200 dark:border-slate-800 text-left">
            <button onClick={() => { setSelectedApp(null); setShowInterviewForm(false); setShowRejectionForm(false); }} className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 z-[160] text-slate-500 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="p-6 sm:p-12 overflow-y-auto custom-scrollbar pt-16 sm:pt-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 mb-10 text-center sm:text-left">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl shrink-0">
                  {selectedApp.candidateInfo.fullName[0]}
                </div>
                <div className="overflow-hidden w-full">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{selectedApp.candidateInfo.fullName}</h2>
                  <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs sm:text-sm truncate">{selectedApp.extractedData.currentTitle}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('talentPool.contactProtocol')}</h4>
                      <div className="space-y-3">
                        <p className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-3 break-all"><svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>{selectedApp.candidateInfo.email}</p>
                        <p className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-3"><svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{selectedApp.candidateInfo.phone}</p>
                      </div>
                    </section>
                    <section>
                      <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('talentPool.professionalClass')}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] md:text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">{selectedApp.extractedData.education}</span>
                        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-[9px] md:text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">{selectedApp.extractedData.experienceYears} {t('talentPool.experience')}</span>
                      </div>
                    </section>
                  </div>
                  <section>
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('talentPool.skillMatrix')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.extractedData.skills.map((s, i) => (
                        <span key={i} className="px-2.5 sm:px-3 py-1 md:py-1.5 bg-indigo-600 text-white rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-md">{s}</span>
                      ))}
                    </div>
                  </section>
                  <section className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('talentPool.executiveSummary')}</h4>
                    <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{selectedApp.extractedData.summary}"</p>
                  </section>
                  {selectedApp.testResult && (
                    <section className="animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
                        <h4 className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">{t('jobs.examSettings')} Data</h4>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">GRADED: {selectedApp.testResult.score}%</span>
                      </div>
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
                          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed italic">"{selectedApp.testResult.evaluation}"</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-8">
                          {selectedApp.test?.map((q, idx) => (
                            <div key={q.id} className="space-y-3">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</p>
                              <p className="text-slate-900 dark:text-white font-bold leading-tight text-sm md:text-base">{q.question}</p>
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Candidate Answer:</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedApp.testResult?.answers[q.id] || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}
                </div>
                <div className="space-y-6 md:space-y-8">
                  <section className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Protocol Actions</h4>
                    <div className="space-y-3 md:space-y-4">
                      <button disabled={isProcessing} onClick={() => handleSendTest(selectedApp)} className="w-full py-4 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Technical Test Email
                      </button>
                      <button disabled={isProcessing} onClick={() => { setShowInterviewForm(!showInterviewForm); setShowRejectionForm(false); }} className="w-full py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                        Technical Meeting
                      </button>
                      {showInterviewForm && (
                        <div className="p-6 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900 space-y-5 animate-in zoom-in-95 shadow-lg">
                          <div>
                            <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Schedule Date/Time</label>
                            <input type="datetime-local" className="w-full p-3 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10" value={interviewData.date} onChange={e => setInterviewData({...interviewData, date: e.target.value})} />
                          </div>
                          <div>
                            <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Notes</label>
                            <textarea className="w-full p-3 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none" rows={4} placeholder="Interview instructions..." value={interviewData.notes} onChange={e => setInterviewData({...interviewData, notes: e.target.value})} />
                          </div>
                          <button onClick={() => handleSendInterview(selectedApp)} disabled={!interviewData.date || isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg">Dispatch Invite</button>
                        </div>
                      )}
                      <button disabled={isProcessing} onClick={() => { initiateRejection(selectedApp); setShowInterviewForm(false); }} className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Rejected
                      </button>
                      {showRejectionForm && (
                        <div className="p-6 bg-white dark:bg-slate-950 rounded-[1.5rem] border border-red-100 dark:border-red-900 space-y-5 animate-in zoom-in-95 shadow-lg">
                           <div>
                            <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Edit Rejection Content</label>
                            <textarea className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium text-xs leading-relaxed outline-none focus:ring-4 focus:ring-red-500/10 resize-none" rows={8} value={rejectionMessage} onChange={e => setRejectionMessage(e.target.value)} />
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => setShowRejectionForm(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                             <button onClick={() => handleSendRejection(selectedApp)} disabled={isProcessing} className="flex-[2] py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg">Dispatch Rejection</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow State</span>
                        <span className={`px-2.5 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase whitespace-nowrap ${getStatusColor(selectedApp.status)}`}>{selectedApp.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">System Archive</span>
                        <button onClick={() => toggleArchive(selectedApp)} className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest underline ${selectedApp.archived ? 'text-indigo-600' : 'text-slate-500'}`}>{selectedApp.archived ? 'RESTORE' : 'ARCHIVE'}</button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
