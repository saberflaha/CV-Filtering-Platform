
import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { Role, PermissionAction, ModulePermissions } from '../../types';

const SYSTEM_MODULES = [
  { id: 'JOBS', name: 'Jobs Management', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
  { id: 'CANDIDATES', name: 'Talent Network', actions: ['VIEW', 'EDIT', 'DELETE', 'EXECUTE', 'EXPORT'] },
  { id: 'CV_PARSING', name: 'CV Intelligence', actions: ['VIEW', 'EXECUTE'] },
  { id: 'ASSESSMENTS', name: 'Technical Exams', actions: ['VIEW', 'EXECUTE'] },
  { id: 'BENCHMARK', name: 'Salary Oracle', actions: ['VIEW', 'EXECUTE'] },
  { id: 'INTELLIGENCE', name: 'Candidate Analytics', actions: ['VIEW', 'EXECUTE'] },
  { id: 'TEAM', name: 'Admin Accounts & Role Assignment', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
  { id: 'ROLES', name: 'RBAC Protocols', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
  { id: 'BRANCHES', name: 'Branch Infrastructure', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
  { id: 'SETTINGS', name: 'System Protocols', actions: ['VIEW', 'EDIT'] },
  { id: 'GUIDE', name: 'System Documentation', actions: ['VIEW'] }
];

export const RolesManagement: React.FC = () => {
  const { roles, addRole, updateRole, deleteRole } = useStorage();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: []
  });

  const handleCreateNew = () => {
    setEditingRole(null);
    setFormData({ name: '', description: '', permissions: [] });
    setShowForm(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData(role);
    setShowForm(true);
  };

  const togglePermission = (moduleId: string, action: string) => {
    const act = action as PermissionAction;
    const currentPerms = [...(formData.permissions || [])];
    const moduleIndex = currentPerms.findIndex(p => p.moduleId === moduleId);

    if (moduleIndex >= 0) {
      const module = { ...currentPerms[moduleIndex] };
      if (module.actions.includes(act)) {
        module.actions = module.actions.filter(a => a !== act);
      } else {
        module.actions.push(act);
      }
      
      if (module.actions.length === 0) {
        currentPerms.splice(moduleIndex, 1);
      } else {
        currentPerms[moduleIndex] = module;
      }
    } else {
      currentPerms.push({ moduleId, actions: [act] });
    }

    setFormData({ ...formData, permissions: currentPerms });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingRole) {
      updateRole(editingRole.id, formData as Role);
    } else {
      const newRole: Role = {
        id: 'role-' + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        description: formData.description || '',
        permissions: formData.permissions || [],
        isSystem: false
      };
      addRole(newRole);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('roles.confirmDelete'))) {
      deleteRole(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade-in-up text-left">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{t('roles.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('roles.sub')}</p>
        </div>
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="btn-premium px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-600/20"
          >
            {t('roles.createRole')}
          </button>
        )}
      </header>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{t('roles.roleName')}</label>
                <input 
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{t('roles.description')}</label>
                <input 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 border-b pb-6 border-slate-100 dark:border-slate-800">{t('roles.modules')} Capabilities</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SYSTEM_MODULES.map((mod) => {
                const modPerm = formData.permissions?.find(p => p.moduleId === mod.id);
                return (
                  <div key={mod.id} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group">
                    <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      {mod.name}
                    </h4>
                    <div className="space-y-4">
                      {mod.actions.map((action) => (
                        <label key={action} className="flex items-center gap-4 cursor-pointer group/label">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              className="peer h-6 w-6 appearance-none rounded-lg border-2 border-slate-200 dark:border-slate-800 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                              checked={modPerm?.actions.includes(action as PermissionAction) || false}
                              onChange={() => togglePermission(mod.id, action)}
                            />
                            <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity ml-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover/label:text-indigo-600 transition-colors">
                            {action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-6 justify-end">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-10 py-5 text-slate-400 dark:text-slate-500 font-black uppercase text-xs tracking-widest hover:text-red-500 transition-colors"
            >
              {t('roles.cancel')}
            </button>
            <button 
              type="submit"
              className="btn-premium px-16 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-indigo-600/20"
            >
              {t('roles.save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map(role => (
            <div key={role.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
              {role.isSystem && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-bl-3xl">
                  {t('roles.systemRole')}
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 group-hover:text-indigo-600 transition-colors">{role.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{role.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-10 min-h-[60px]">
                {role.permissions.slice(0, 4).map(p => (
                  <span key={p.moduleId} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {p.moduleId} ({p.actions.length})
                  </span>
                ))}
                {role.permissions.length > 4 && (
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg">
                    +{role.permissions.length - 4} More
                  </span>
                )}
              </div>

              <div className="flex gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={() => handleEdit(role)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {t('roles.edit')}
                </button>
                {!role.isSystem && (
                  <button 
                    onClick={() => handleDelete(role.id)}
                    className="flex-1 py-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    {t('roles.delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
