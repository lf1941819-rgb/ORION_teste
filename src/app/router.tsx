import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import WorkspacePage from '../features/workspace/pages/WorkspacePage';
import GraphPage from '../features/graph/pages/GraphPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/lab" /> : <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/cadastro" element={<PublicRoute><SignupPage /></PublicRoute>} />
        
        <Route path="/lab" element={<PrivateRoute><WorkspacePage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/grafo" element={<PrivateRoute><GraphPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
