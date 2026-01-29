
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, branches } = useStorage();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const branchId = query.get('branch');
  const activeBranch = branches.find(b => b.id === branchId);

  // Fix: Added async and await to properly handle the login Promise and removed unsupported 3rd argument
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Access Denied. Protocol signature mismatch.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#020617] overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Visual Side: Immersive System Backdrop */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950">
        {/* Background Image - Capturing the High-Tech Office vibe from user prompt */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070" 
            alt="Modern Command Center" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#020617]/50 to-[#020617]"></div>
        </div>

        {/* Floating Holographic Interface Representation */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-20">
          <div className="relative w-full max-w-2xl aspect-square rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.15)] animate-float">
            {/* Inner Content mimicking the provided image's dashboard vibe */}
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md"></div>
            
            {/* Top Bar of the "Hologram" */}
            <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/5 flex items-center px-10 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">System Status: Nominal</span>
            </div>

            {/* Visualizing the "HR Platform" title from user's image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-12">
               <h2 className="text-white text-5xl font-black uppercase tracking-tighter mb-4 italic opacity-80">
                 HR <span className="text-indigo-400">Platform</span>
               </h2>
               <div className="w-64 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 mb-12"></div>
               
               {/* Dashboard Elements placeholder visuals */}
               <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="w-full h-3 bg-white/10 rounded-full"></div>
                    <div className="w-2/3 h-3 bg-white/10 rounded-full"></div>
                    <div className="w-full h-20 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mt-2"></div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin-slow flex items-center justify-center">
                       <span className="text-2xl font-black text-emerald-400">85%</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Scanning Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none h-1/2 animate-pulse"></div>
          </div>
        </div>

        {/* Floating Code Snippets for "Distinctive Harmony" */}
        <div className="absolute bottom-12 left-12 font-mono text-[9px] text-slate-500/50 space-y-1">
          <p>AUTHENTICATION_PROTOCOL_V4.2</p>
          <p>ENCRYPTION_LAYER: RSA_4096</p>
          <p>GEOSPATIAL_TAG: AMMAN_JORDAN</p>
        </div>
      </div>

      {/* Login Side */}
      <div className="w-full lg:w-[480px] flex flex-col items-center justify-center p-8 md:p-16 relative z-20 bg-[#020617] lg:shadow-[-50px_0_100px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-1000">
          
          {/* Header & Branch Identification */}
          <div className="text-left mb-12">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-600/30">
                {activeBranch ? activeBranch.name[0] : 'H'}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-1">Ecosystem Login</span>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {activeBranch ? activeBranch.name : 'Central Intelligence'}
                </h1>
              </div>
            </div>
            <p className="text-slate-400 font-medium text-base leading-relaxed border-l-2 border-indigo-500/30 pl-6">
              Initialize authorized session for <span className="text-white font-bold">{activeBranch?.companyName || 'HQ Personnel'}</span>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}

            <div className="group space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 group-focus-within:text-indigo-400 transition-colors">
                Personnel ID (Email)
              </label>
              <input 
                required
                type="email"
                className="w-full px-6 py-5 rounded-2xl border border-slate-800 bg-slate-900/50 text-white outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-700"
                placeholder="admin@protocol.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="group space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 group-focus-within:text-indigo-400 transition-colors">
                Access Key
              </label>
              <input 
                required
                type="password"
                className="w-full px-6 py-5 rounded-2xl border border-slate-800 bg-slate-900/50 text-white outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-bold placeholder:text-slate-700"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center group"
            >
              <span>Verify Identity</span>
              <svg className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </form>

          {/* Bottom Branding */}
          <div className="mt-16 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] leading-loose">
              Proprietary Technology • 2024 Ecosystem
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
