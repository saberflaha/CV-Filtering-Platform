import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStorage } from '../hooks/useStorage';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';
import { Logo } from './Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, language, setLanguage, hasPermission, toasts, removeToast, loading } = useStorage();
  const { t } = useTranslation();
  
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.AR : Language.EN);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = currentUser ? [
    ...(hasPermission('JOBS', 'VIEW') ? [{ to: '/admin/jobs', label: t('nav.jobs'), icon: '💼' }] : []),
    ...(hasPermission('CANDIDATES', 'VIEW') ? [{ to: '/admin/talent', label: t('nav.talentPool'), icon: '👥' }] : []),
    ...(hasPermission('INTELLIGENCE', 'VIEW') ? [{ to: '/admin/intelligence', label: t('nav.intelligence'), icon: '🧠' }] : []),
  ].sort((a, b) => a.label.localeCompare(b.label)) : [
    { to: '/', label: t('nav.portal'), icon: '🌐' },
    { to: '/admin/login', label: t('nav.login'), icon: '🔐' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Layer */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center justify-between p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-l-4 animate-in slide-in-from-top duration-500 bg-white dark:bg-slate-900 ${
              toast.type === 'success' ? 'border-emerald-500 text-emerald-900 dark:text-emerald-400' : 
              toast.type === 'error' ? 'border-red-500 text-red-900 dark:text-red-400' : 
              'border-indigo-500 text-slate-900 dark:text-slate-300'
            }`}
          >
            <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        ))}
      </div>

      {loading && location.pathname !== '/admin/login' && (
        <div className="fixed inset-0 bg-[#020617]/40 backdrop-blur-sm z-[300] flex items-center justify-center">
           <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Modern Desktop Sidebar/Header hybrid */}
      <nav className="hidden lg:block glass-panel sticky top-0 z-[100] border-b border-slate-200 dark:border-white/5 h-24 no-print">
        <div className="max-w-[1600px] mx-auto px-10 h-full flex items-center justify-between">
          <Link to={currentUser ? "/admin" : "/"} className="hover:opacity-80 transition-all">
            <Logo size="md" />
          </Link>
          
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 ${location.pathname === link.to ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10"></div>

            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:scale-105 transition-all">
                {isDarkMode ? '🌞' : '🌙'}
              </button>
              <button onClick={toggleLanguage} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                {language === Language.EN ? 'AR' : 'EN'}
              </button>
              {currentUser && (
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right hidden xl:block">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">{currentUser.fullName}</p>
                    <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">{currentUser.position}</p>
                  </div>
                  <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20 hover:bg-red-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="lg:hidden sticky top-0 z-[100] mobile-header-blur border-b border-slate-200 dark:border-white/5 px-6 h-20 flex items-center justify-between no-print">
        <Link to={currentUser ? "/admin" : "/"}><Logo size="sm" /></Link>
        <div className="flex items-center gap-3">
           <button onClick={toggleTheme} className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 shadow-sm">
            {isDarkMode ? '🌞' : '🌙'}
          </button>
          {currentUser && (
            <button onClick={() => setIsMobileMenuOpen(true)} className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {currentUser.fullName[0]}
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-xl lg:hidden animate-in fade-in duration-300">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#020617] p-10 shadow-2xl animate-in slide-in-from-right duration-500 border-l border-white/5">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Navigation</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="block text-lg font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-slate-200 dark:bg-white/10 my-8"></div>
              <button onClick={toggleLanguage} className="w-full text-left font-black uppercase tracking-widest text-indigo-600">
                Switch to {language === Language.EN ? 'Arabic' : 'English'}
              </button>
              <button onClick={handleLogout} className="w-full text-left font-black uppercase tracking-widest text-red-500 mt-10">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};