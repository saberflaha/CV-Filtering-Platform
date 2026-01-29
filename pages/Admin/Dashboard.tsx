
import React, { useState, useEffect, useMemo } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { jobs, applications, currentUser, updateSettings, settings, branches, notifications, markNotificationRead, activeBranchId, hasPermission } = useStorage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [modalType, setModalType] = useState<'settings' | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const [recentPage, setRecentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const itemsPerPage = 5;
  const branch = branches.find(b => b.id === activeBranchId);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const activeApps = useMemo(() => applications.filter(a => !a.archived), [applications]);
  const totalRecentPages = Math.ceil(activeApps.length / itemsPerPage);
  const paginatedRecent = activeApps.slice((recentPage - 1) * itemsPerPage, recentPage * itemsPerPage);

  const metrics = [
    { label: t('dashboard.metrics.activeReqs'), value: jobs.filter(j => !j.archived).length, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4', color: 'indigo' },
    { label: t('dashboard.metrics.talentPool'), value: activeApps.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'emerald' },
    { label: t('dashboard.metrics.archivedVault'), value: jobs.filter(j => j.archived).length + applications.filter(a => a.archived).length, icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', color: 'slate' }
  ];

  const handleAlertClick = (n: any) => {
    markNotificationRead(n.id);
    setSelectedAlert(n);
  };

  const handleGoToProfile = () => {
    navigate('/admin/talent');
    setSelectedAlert(null);
  };

  const saveSettings = () => {
    updateSettings(localSettings);
    setModalType(null);
  };

  const governanceItems = [
    ...(hasPermission('TEAM', 'VIEW') ? [{ to: '/admin/team', title: 'Team Governance', sub: 'Admin Accounts', icon: '🛡️' }] : []),
    ...(hasPermission('ROLES', 'VIEW') ? [{ to: '/admin/roles', title: 'RBAC Protocols', sub: 'Permissions', icon: '🔑' }] : []),
    ...(hasPermission('BRANCHES', 'VIEW') ? [{ to: '/admin/branches', title: 'System Infrastructure', sub: 'Branch Clusters', icon: '🏢' }] : []),
    ...(hasPermission('GUIDE', 'VIEW') ? [{ to: '/admin/guide', title: 'HR Documentation', sub: 'Operational Manual', icon: '📚' }] : []),
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 md:py-16 animate-fade-in-up">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 md:mb-16 gap-10 text-left">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-5 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-lg shadow-indigo-600/30">
              {branch?.name || 'Main Command'}
            </span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{currentUser?.role} Operations</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
            {t('dashboard.title')}
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <Link 
            to="/"
            className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:border-indigo-500 transition-all text-center flex-1 lg:flex-none"
          >
            {t('nav.portal')}
          </Link>
          <button 
            onClick={() => setModalType('settings')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:scale-110 hover:border-indigo-500 transition-all text-slate-500 dark:text-slate-400 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
          </button>
          <Link 
            to="/admin/jobs"
            className="btn-premium px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 text-center flex-1 lg:flex-none"
          >
            {t('jobs.createJob')}
          </Link>
        </div>
      </header>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16 text-left">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="relative z-10">
              <div className={`w-14 h-14 bg-${m.color}-50 dark:bg-${m.color}-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                <svg className={`w-7 h-7 text-${m.color}-600 dark:text-${m.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={m.icon}></path></svg>
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 text-left mb-20">
        <div className="lg:col-span-3 space-y-10">
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('dashboard.recentIntelligence')}</h3>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-1">Live Feed of New Candidates</p>
              </div>
              <Link 
                to="/admin/talent" 
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                {t('dashboard.fullDatabase')}
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-6">{t('dashboard.identity')}</th>
                    <th className="px-8 py-6">{t('dashboard.status')}</th>
                    <th className="px-8 py-6 text-right">{t('dashboard.match')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedRecent.map((app) => (
                    <tr key={app.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer" onClick={() => navigate('/admin/talent')}>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{app.candidateInfo.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{app.extractedData.currentTitle}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                            {app.status.replace(/_/g, ' ')}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-indigo-600 text-lg">
                        {app.matchScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalRecentPages > 1 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2">
                <button disabled={recentPage === 1} onClick={() => setRecentPage(p => p - 1)} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-30">Prev</button>
                <button disabled={recentPage === totalRecentPages} onClick={() => setRecentPage(p => p + 1)} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-30">Next</button>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t('dashboard.systemAlerts')}</h4>
              {notifications.some(n => !n.read) && <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,1)]"></span>}
            </div>
            <div className="space-y-6">
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map(n => (
                  <div 
                    key={n.id} 
                    className={`flex gap-4 group cursor-pointer p-4 -mx-4 rounded-2xl transition-all ${n.read ? 'opacity-50' : 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100/50 shadow-sm'}`} 
                    onClick={() => handleAlertClick(n)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 truncate">{n.title}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4">{t('dashboard.noAlerts')}</p>
              )}
            </div>
          </section>

          {/* Workforce Oracle Quick Action */}
          <section className="bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden group border border-white/5">
            <div className="absolute inset-0 bg-indigo-600/10 blur-[80px] group-hover:bg-indigo-600/20 transition-all"></div>
            <div className="relative z-10 text-center">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">{t('dashboard.oracleTitle')}</h4>
              <p className="text-slate-400 font-bold text-xs leading-relaxed mb-8">
                {t('dashboard.oracleSub')}
              </p>
              <Link to="/admin/career" className="btn-premium block w-full py-4 bg-white text-slate-950 text-center rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                {t('dashboard.newProjection')}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* NEW CONSOLIDATED GOVERNANCE SECTION */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
         <div className="flex items-center gap-6 mb-10">
            <div className="h-[2px] flex-grow bg-slate-200 dark:bg-slate-800"></div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">System Administration & Governance</h3>
            <div className="h-[2px] flex-grow bg-slate-200 dark:bg-slate-800"></div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceItems.map((item, idx) => (
              <Link 
                key={idx} 
                to={item.to}
                className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all relative overflow-hidden flex flex-col text-left"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner relative z-10 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 relative z-10 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                  {item.sub}
                </p>
                
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Execute Protocol</span>
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            ))}
         </div>
      </section>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[160] flex items-center justify-center p-6 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/5 animate-in zoom-in-95">
             <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">{selectedAlert.title}</h3>
             <p className="text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed">{selectedAlert.message}</p>
             <div className="flex flex-col gap-3">
               <button onClick={handleGoToProfile} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Open Talent Profile</button>
               <button onClick={() => setSelectedAlert(null)} className="w-full py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Close Notification</button>
             </div>
          </div>
        </div>
      )}

      {/* REDESIGNED Protocol Config Modal */}
      {modalType === 'settings' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[150] flex items-center justify-center p-4">
          <div className="bg-[#0f172a]/95 dark:bg-[#020617]/95 rounded-[3.5rem] w-full max-w-2xl shadow-[0_0_100px_rgba(79,70,229,0.2)] border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500 text-left">
            {/* Header Area */}
            <div className="px-10 pt-12 pb-8 border-b border-white/5 relative">
              <div className="absolute top-10 right-10 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-600/30 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    Protocol <span className="text-indigo-400">Config</span>
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-1">Operational Environment Parameters</p>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid gap-8">
                {/* Field 1 */}
                <div className="group space-y-3">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                      [01] EmailJS Public Key
                    </label>
                    <span className="text-[8px] font-mono text-slate-700">ENCRYPTED_LAYER</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    </div>
                    <input 
                      type="text" 
                      className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/5 text-white font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="pk_live_****************"
                      value={localSettings.emailjsPublicKey} 
                      onChange={e => setLocalSettings({...localSettings, emailjsPublicKey: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Field 2 */}
                <div className="group space-y-3">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                      [02] Dispatch Service ID
                    </label>
                    <span className="text-[8px] font-mono text-slate-700">IO_PORT_MAPPING</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <input 
                      type="text" 
                      className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/5 text-white font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="service_********"
                      value={localSettings.emailjsServiceId} 
                      onChange={e => setLocalSettings({...localSettings, emailjsServiceId: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Field 3 */}
                <div className="group space-y-3">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                      [03] Template Blueprint ID
                    </label>
                    <span className="text-[8px] font-mono text-slate-700">XML_SCHEMA_LINK</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <input 
                      type="text" 
                      className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/5 text-white font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-700" 
                      placeholder="template_********"
                      value={localSettings.emailjsTemplateId} 
                      onChange={e => setLocalSettings({...localSettings, emailjsTemplateId: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={() => setModalType(null)} 
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-red-400 transition-colors border border-white/5 rounded-2xl"
                >
                  Abort Session
                </button>
                <button 
                  onClick={saveSettings} 
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group"
                >
                  <span>Commit Infrastructure Changes</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </button>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-white/5 px-10 py-4 flex justify-between items-center">
               <div className="flex gap-4">
                 <span className="text-[8px] font-mono text-slate-500">SYS_UPTIME: 99.99%</span>
                 <span className="text-[8px] font-mono text-slate-500">REGION: AMM_JOR</span>
               </div>
               <span className="text-[8px] font-mono text-emerald-500 animate-pulse uppercase">Authorized Session Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
