
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorage } from '../../hooks/useStorage';
import { AdminUser } from '../../types';

export const TeamManagement: React.FC = () => {
  const { adminUsers, addAdminUser, deleteAdminUser, currentUser, activeBranchId, roles, hasPermission } = useStorage();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    phone: '',
    roleId: ''
  });

  const canCreate = hasPermission('TEAM', 'CREATE');
  const canDelete = hasPermission('TEAM', 'DELETE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleId) {
      alert("Please select a valid organizational role.");
      return;
    }

    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      email: formData.email,
      position: formData.position,
      phone: formData.phone,
      roleId: formData.roleId,
      role: roles.find(r => r.id === formData.roleId)?.id === 'role-super' ? 'super' : 'admin',
      branchId: activeBranchId,
      createdAt: Date.now()
    };

    addAdminUser(newUser);
    setShowAdd(false);
    setFormData({ fullName: '', email: '', position: '', phone: '', roleId: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left animate-fade-in-up">
      <div className="mb-6">
        <Link 
          to="/admin" 
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-black uppercase text-[10px] tracking-widest group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Team Governance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage administrative access and organizational role distribution.</p>
        </div>
        {canCreate && !showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>Create Admin Account</span>
          </button>
        )}
      </header>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl mb-12 animate-in slide-in-from-top-8 duration-500">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Provision New Access</h3>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 p-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Personnel Full Name</label>
                <input required className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Official Email Address</label>
                <input required type="email" className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Authorized Phone Number</label>
                <input required className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-6">
               <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Designated Role Protocol</label>
                <select 
                  required 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={formData.roleId}
                  onChange={e => setFormData({...formData, roleId: e.target.value})}
                >
                  <option value="">Choose organizational role...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-2 ml-2 italic">Permissions are inherited from the selected protocol.</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Functional Job Title</label>
                <input required className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div className="flex justify-end pt-6">
                <button type="submit" className="bg-slate-900 dark:bg-indigo-600 text-white px-16 py-5 rounded-2xl font-black shadow-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">
                  Authorize Personnel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {adminUsers.map(user => {
          const userRole = roles.find(r => r.id === user.roleId);
          return (
            <div key={user.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white text-2xl font-black shadow-lg relative z-10">
                  {user.fullName[0]}
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 ${user.roleId === 'role-super' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {userRole?.name || user.role}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 relative z-10 truncate">{user.fullName}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-6 relative z-10 truncate">{user.position}</p>
              
              <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <svg className="w-4 h-4 mr-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <svg className="w-4 h-4 mr-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>{user.phone}</span>
                </div>
              </div>

              {canDelete && user.id !== currentUser?.id && (
                <button 
                  onClick={() => deleteAdminUser(user.id)}
                  className="mt-8 text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Decommission Access
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
