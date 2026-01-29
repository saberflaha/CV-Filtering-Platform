
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PublicPortal } from './pages/Public/Portal';
import { ApplyPage } from './pages/Public/Apply';
import { TestPage } from './pages/Public/Test';
import { JobDetailPage } from './pages/Public/JobDetail';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { TalentPool } from './pages/Admin/TalentPool';
import { AdminJobs } from './pages/Admin/Jobs';
import { AdminLogin } from './pages/Admin/Login';
import { TeamManagement } from './pages/Admin/Team';
import { BranchManagement } from './pages/Admin/Branches';
import { CareerPath } from './pages/Admin/CareerPath';
import { SystemGuide } from './pages/Admin/SystemGuide';
import { CandidateIntelligence } from './pages/Admin/CandidateIntelligence';
import { RolesManagement } from './pages/Admin/RolesManagement'; // NEW IMPORT
import { AdminGuard } from './components/AdminGuard';
import { StorageProvider } from './hooks/useStorage';

const App: React.FC = () => {
  return (
    <StorageProvider>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicPortal />} />
            <Route path="/job/:jobId" element={<JobDetailPage />} />
            <Route path="/apply/:jobId" element={<ApplyPage />} />
            <Route path="/test/:jobId" element={<TestPage />} />
            
            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            } />
            <Route path="/admin/talent" element={
              <AdminGuard>
                <TalentPool />
              </AdminGuard>
            } />
            <Route path="/admin/jobs" element={
              <AdminGuard>
                <AdminJobs />
              </AdminGuard>
            } />
            <Route path="/admin/intelligence" element={
              <AdminGuard>
                <CandidateIntelligence />
              </AdminGuard>
            } />
            <Route path="/admin/roles" element={ // NEW ROUTE
              <AdminGuard>
                <RolesManagement />
              </AdminGuard>
            } />
            <Route path="/admin/career" element={
              <AdminGuard>
                <CareerPath />
              </AdminGuard>
            } />
            <Route path="/admin/team" element={
              <AdminGuard>
                <TeamManagement />
              </AdminGuard>
            } />
            <Route path="/admin/branches" element={
              <AdminGuard>
                <BranchManagement />
              </AdminGuard>
            } />
            <Route path="/admin/guide" element={
              <AdminGuard>
                <SystemGuide />
              </AdminGuard>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StorageProvider>
  );
};

export default App;
