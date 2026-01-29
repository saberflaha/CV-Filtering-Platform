import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import { JobPost, Application, AdminUser, Branch, Notification, AppSettings, Language, Role, PermissionAction, Toast } from '../types';

const SESSION_KEY = 'hr_platform_session';

export interface StorageContextType {
  branches: Branch[];
  jobs: JobPost[];
  applications: Application[];
  adminUsers: AdminUser[];
  roles: Role[];
  settings: AppSettings;
  currentUser: AdminUser | null;
  loading: boolean;
  activeBranchId: string;
  language: Language;
  toasts: Toast[];
  notifications: Notification[];
  
  refreshData: () => Promise<void>;
  addJob: (job: JobPost) => Promise<void>;
  updateJob: (id: string, updates: Partial<JobPost>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  addApplication: (app: Application) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  addAdminUser: (user: AdminUser) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  setLanguage: (lang: Language) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (moduleId: string, action: PermissionAction) => boolean;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addRole: (role: Role) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  addBranch: (branch: Branch) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [language, setLanguageState] = useState<Language>(Language.EN);
  const [settings, setSettings] = useState<AppSettings>({ emailjsPublicKey: '', emailjsServiceId: '', emailjsTemplateId: '' });

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const seedDatabase = async () => {
    // Check for roles
    const existingRoles = await apiService.admin.getRoles();
    if (existingRoles.length === 0) {
      const superRole: Role = {
        id: 'role-super',
        name: 'Super Admin',
        description: 'Global system override and governance.',
        isSystem: true,
        permissions: [
          { moduleId: 'JOBS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
          { moduleId: 'CANDIDATES', actions: ['VIEW', 'EDIT', 'DELETE', 'EXECUTE', 'EXPORT'] },
          { moduleId: 'CV_PARSING', actions: ['VIEW', 'EXECUTE'] },
          { moduleId: 'ASSESSMENTS', actions: ['VIEW', 'EXECUTE'] },
          { moduleId: 'BENCHMARK', actions: ['VIEW', 'EXECUTE'] },
          { moduleId: 'INTELLIGENCE', actions: ['VIEW', 'EXECUTE'] },
          { moduleId: 'TEAM', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
          { moduleId: 'ROLES', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
          { moduleId: 'BRANCHES', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
          { moduleId: 'SETTINGS', actions: ['VIEW', 'EDIT'] },
          { moduleId: 'GUIDE', actions: ['VIEW'] }
        ]
      };
      await apiService.admin.saveRole(superRole);
    }

    // Check for users
    const users = await apiService.admin.getUsers();
    if (users.length === 0) {
      const defaultAdmin: AdminUser = {
        id: 'admin-primary',
        fullName: 'System Architect',
        email: 'admin@protocol.ai',
        position: 'Super Administrator',
        phone: 'Admin@123', // Used as password in mock auth
        role: 'super',
        roleId: 'role-super',
        branchId: 'main-hub',
        createdAt: Date.now()
      };
      await apiService.admin.saveUser(defaultAdmin);
    }

    // Check for branches
    const existingBranches = await apiService.branches.list();
    if (existingBranches.length === 0) {
      await apiService.branches.save({
        id: 'main-hub',
        name: 'Central Intelligence Hub',
        companyName: 'Protocol AI Global',
        createdAt: Date.now()
      });
    }
  };

  const refreshData = async () => {
    try {
      await seedDatabase();
      const [b, j, a, u, r, n] = await Promise.all([
        apiService.branches.list(),
        apiService.jobs.list(),
        apiService.applications.list(),
        apiService.admin.getUsers(),
        apiService.admin.getRoles(),
        apiService.notifications.list()
      ]);

      setBranches(b);
      setJobs(j);
      setApplications(a);
      setAdminUsers(u);
      setRoles(r);
      setNotifications(n);

      // Restore session
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const found = u.find(user => user.id === sessionId);
        if (found) setCurrentUser(found);
      }
    } catch (err) {
      addToast("Core System Connectivity Error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const savedSettings = localStorage.getItem('hireai_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedLang = localStorage.getItem('hireai_lang');
    if (savedLang) setLanguageState(savedLang as Language);
  }, []);

  const activeBranchId = currentUser?.branchId || 'main-hub';

  const addJob = async (job: JobPost) => {
    await apiService.jobs.save({ ...job, branchId: activeBranchId });
    await refreshData();
  };

  const updateJob = async (id: string, updates: Partial<JobPost>) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      await apiService.jobs.save({ ...job, ...updates });
      await refreshData();
    }
  };

  const deleteJob = async (id: string) => {
    await apiService.jobs.delete(id);
    await refreshData();
  };

  const addApplication = async (app: Application) => {
    await apiService.applications.save({ ...app, branchId: activeBranchId });
    await refreshData();
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      await apiService.applications.save({ ...app, ...updates, version: (app.version || 1) + 1 });
      await refreshData();
    }
  };

  const addAdminUser = async (user: AdminUser) => {
    await apiService.admin.saveUser(user);
    await refreshData();
  };

  const deleteAdminUser = async (id: string) => {
    await apiService.admin.deleteUser(id);
    await refreshData();
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('hireai_settings', JSON.stringify(newSettings));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hireai_lang', lang);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = adminUsers.find(u => u.email === email && u.phone === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(SESSION_KEY, user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const hasPermission = (moduleId: string, action: PermissionAction): boolean => {
    if (!currentUser) return false;
    const userRole = roles.find(r => r.id === currentUser.roleId);
    return userRole?.permissions.find(p => p.moduleId === moduleId)?.actions.includes(action) || false;
  };

  const addRole = async (role: Role) => {
    await apiService.admin.saveRole(role);
    await refreshData();
  };

  const updateRole = async (id: string, updates: Partial<Role>) => {
    const role = roles.find(r => r.id === id);
    if (role) {
      await apiService.admin.saveRole({ ...role, ...updates });
      await refreshData();
    }
  };

  const deleteRole = async (id: string) => {
    await apiService.admin.deleteRole(id);
    await refreshData();
  };

  const addBranch = async (branch: Branch) => {
    await apiService.branches.save(branch);
    await refreshData();
  };

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif = { ...n, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), read: false };
    await apiService.notifications.save(newNotif);
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    const n = notifications.find(notif => notif.id === id);
    if (n) {
      await apiService.notifications.save({ ...n, read: true });
      await refreshData();
    }
  };

  return (
    <StorageContext.Provider value={{
      branches, jobs, applications, adminUsers, roles, settings, currentUser, loading,
      activeBranchId, language, toasts, notifications, refreshData,
      addJob, updateJob, deleteJob, addApplication, updateApplication, addAdminUser, deleteAdminUser,
      updateSettings, setLanguage, login, logout, hasPermission,
      addToast, removeToast, addRole, updateRole, deleteRole, addBranch, addNotification, markNotificationRead
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within a StorageProvider');
  return context;
};