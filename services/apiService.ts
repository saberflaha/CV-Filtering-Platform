import { dbService } from './db';
import { JobPost, Application, AdminUser, Branch, Role, Notification } from '../types';

/**
 * BACKEND API SERVICE (MOCKED)
 * This layer simulates a REST/GraphQL Backend. 
 * Transitioning to a real server involves replacing these methods with fetch() calls.
 */

export const apiService = {
  // Jobs Module
  jobs: {
    list: () => dbService.getAll<JobPost>('jobs'),
    save: (job: JobPost) => dbService.put('jobs', job),
    delete: (id: string) => dbService.delete('jobs', id),
  },

  // Talent Module
  applications: {
    list: () => dbService.getAll<Application>('applications'),
    save: (app: Application) => dbService.put('applications', app),
    delete: (id: string) => dbService.delete('applications', id),
    updateStatus: async (id: string, status: any) => {
      const apps = await dbService.getAll<Application>('applications');
      const app = apps.find(a => a.id === id);
      if (app) {
        await dbService.put('applications', { ...app, status, version: (app.version || 1) + 1 });
      }
    }
  },

  // Governance Module
  admin: {
    getUsers: () => dbService.getAll<AdminUser>('adminUsers'),
    saveUser: (user: AdminUser) => dbService.put('adminUsers', user),
    deleteUser: (id: string) => dbService.delete('adminUsers', id),
    getRoles: () => dbService.getAll<Role>('roles'),
    saveRole: (role: Role) => dbService.put('roles', role),
    deleteRole: (id: string) => dbService.delete('roles', id),
  },

  // Systems Module
  branches: {
    list: () => dbService.getAll<Branch>('branches'),
    save: (branch: Branch) => dbService.put('branches', branch),
  },

  // Notification Module
  notifications: {
    list: () => dbService.getAll<Notification>('notifications'),
    save: (n: Notification) => dbService.put('notifications', n),
  }
};