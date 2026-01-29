
import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Branch, AdminUser } from '../../types';

export const BranchManagement: React.FC = () => {
  const { branches, addBranch, addAdminUser, currentUser, addToast } = useStorage();
  const [showForm, setShowForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', companyName: '' });
  const [generatedCreds, setGeneratedCreds] = useState<{ email: string, pass: string, branchName: string } | null>(null);

  const isSuper = currentUser?.role === 'super';

  const generateCredentials = (branchName: string) => {
    // REQ-BR-001: Generate Email: [branchname]@company.com
    // Format: All lowercase, spaces replaced with dots
    const emailPrefix = branchName.toLowerCase().trim().replace(/\s+/g, '.');
    const email = `${emailPrefix}@company.com`;

    // REQ-BR-001: Generate Secure Password (Min 8 chars, 1 upper, 1 lower, 1 num, 1 special)
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";
    
    const getRandom = (str: string) => str[Math.floor(Math.random() * str.length)];
    
    let password = [
      getRandom(upper),
      getRandom(lower),
      getRandom(numbers),
      getRandom(special)
    ];

    const allChars = upper + lower + numbers + special;
    // Generate up to 12 chars for extra entropy
    for (let i = 0; i < 8; i++) {
      password.push(getRandom(allChars));
    }

    // Shuffle for non-predictability
    const shuffledPass = password.sort(() => Math.random() - 0.5).join('');
    
    return { email, password: shuffledPass };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const branchId = 'branch-' + Math.random().toString(36).substr(2, 9);
    const { email, password } = generateCredentials(newBranch.name);

    // Create Branch Record
    const branch: Branch = {
      id: branchId,
      name: newBranch.name,
      companyName: newBranch.companyName,
      createdAt: Date.now()
    };

    // Create Branch Admin (Restricted to this branch only)
    const branchAdmin: AdminUser = {
      id: 'admin-' + Math.random().toString(36).substr(2, 9),
      fullName: `${newBranch.name} Administrator`,
      email: email,
      position: 'Branch Manager',
      phone: password, // Password stored in phone field for mock auth logic
      role: 'admin',
      roleId: 'role-recruiter',
      branchId: branchId,
      createdAt: Date.now()
    };

    addBranch(branch);
    addAdminUser(branchAdmin);
    
    setGeneratedCreds({ 
      email, 
      pass: password, 
      branchName: newBranch.name 
    });
    
    addToast("Branch Infrastructure Provisioned", 'success');
    setNewBranch({ name: '', companyName: '' });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} Copied to Clipboard`, 'success');
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#/admin/login?branch=${id}`;
    navigator.clipboard.writeText(url);
    addToast('Unique System Link Copied', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-left animate-fade-in-up">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">System Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Create and isolate independent recruitment ecosystems.</p>
        </div>
        {isSuper && (
          <button 
            onClick={() => { setShowForm(true); setGeneratedCreds(null); }}
            className="btn-premium bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-600/20"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            Create New System
          </button>
        )}
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          {!generatedCreds ? (
            <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3.5rem] w-full max-w-lg shadow-2xl space-y-10 animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">System Activation</h3>
                <p className="text-slate-500 font-medium italic">Admin credentials will be generated automatically following REQ-BR-001 protocols.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3 ml-2">Internal Ecosystem Name</label>
                  <input required className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all" placeholder="e.g. Amman Tech" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-3 ml-2">Parent Company Identity</label>
                  <input required className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all" placeholder="e.g. Elite Talent Solutions" value={newBranch.companyName} onChange={e => setNewBranch({...newBranch, companyName: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-6 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 font-black uppercase text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="btn-premium flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Activate System</button>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3.5rem] w-full max-w-xl shadow-2xl border-2 border-indigo-500 animate-in zoom-in-95">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">Ecosystem Activated</h3>
                <p className="text-slate-500 font-medium">Auto-generated admin credentials for <b>{generatedCreds.branchName}</b></p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Generated Admin Email</p>
                  <div className="flex justify-between items-center">
                    <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate pr-4">{generatedCreds.email}</code>
                    <button onClick={() => copyToClipboard(generatedCreds.email, 'Email')} className="text-[9px] font-black uppercase text-indigo-500 underline hover:text-indigo-600">Copy Email</button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Secure Access Key (Password)</p>
                  <div className="flex justify-between items-center">
                    <code className="text-sm font-bold text-slate-900 dark:text-white truncate pr-4">{generatedCreds.pass}</code>
                    <button onClick={() => copyToClipboard(generatedCreds.pass, 'Password')} className="text-[9px] font-black uppercase text-indigo-500 underline hover:text-indigo-600">Copy Key</button>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed text-center italic">
                    Note: These credentials will not be displayed again. Ensure they are shared with the branch admin.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowForm(false)}
                className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
              >
                Close and Continue
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {branches.map(b => (
          <div key={b.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="mb-10 relative z-10">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{b.name}</h4>
              <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">{b.companyName}</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-10 relative z-10">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center">BRANCH ACCESS LINK</p>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <code className="text-[11px] font-bold block truncate text-indigo-600 dark:text-indigo-400 text-center tracking-tight">
                  {window.location.origin}/#/admin/login?branch={b.id}
                </code>
              </div>
              <button 
                onClick={() => copyLink(b.id)}
                className="btn-premium w-full py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-600 dark:hover:border-indigo-500 transition-all shadow-sm"
              >
                Copy Link
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-8">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">ID: {b.id.split('-').pop()}</span>
              <span>{new Date(b.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
