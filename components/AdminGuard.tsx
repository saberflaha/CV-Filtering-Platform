
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStorage } from '../hooks/useStorage';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStorage();

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
