import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import PublicRoute from './components/common/PublicRoute';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import DashboardPage from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import SkillsPage from './pages/student/SkillsPage';
import SkillExchangePage from './pages/student/SkillExchangePage';
import ProjectsPage from './pages/student/ProjectsPage';
import RecommendedProjectsPage from './pages/student/RecommendedProjectsPage';
import ProjectWorkspacePage from './pages/student/ProjectWorkspacePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Only Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-exchange"
              element={
                <ProtectedRoute>
                  <SkillExchangePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/workspace"
              element={
                <ProtectedRoute>
                  <ProjectWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendedProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
