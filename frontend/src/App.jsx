import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { initScrollbarCompensation } from './utils/scrollLockUtils';

// Public Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ComingSoon from './pages/public/ComingSoon';

// Protected Pages
impo
rt SummariesPage from './pages/SummariesPage';
import TodayPage from './pages/TodayPage';

import PastSummariesPage from './pages/PastSummariesPage';
import PastSummariesTopicPage from './pages/PastSummariesTopicPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import DiscoverUsersPage from './pages/DiscoverUsersPage';

import './styles/globals.css';
import './styles/animations.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // Initialize scrollbar compensation on app start
  useEffect(() => {
    initScrollbarCompensation();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              
              {/* Auth redirects to coming soon */}
              <Route path="/join" element={<Navigate to="/coming-soon" replace />} />
              <Route path="/login" element={<Navigate to="/coming-soon" replace />} />
              <Route path="/register" element={<Navigate to="/coming-soon" replace />} />
              <Route path="/auth/*" element={<Navigate to="/coming-soon" replace />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/summaries" element={
                <ProtectedRoute>
                  <SummariesPage />
                </ProtectedRoute>
              } />              <Route path="/today" element={
                <ProtectedRoute>
                  <TodayPage />
                </ProtectedRoute>
              } />

              <Route path="/past-summaries" element={
                <ProtectedRoute>
                  <PastSummariesPage />
                </ProtectedRoute>
              } />
              <Route path="/past-summaries/:topic" element={
                <ProtectedRoute>
                  <PastSummariesTopicPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId/followers" element={
                <ProtectedRoute>
                  <FollowersPage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId/following" element={
                <ProtectedRoute>
                  <FollowingPage />
                </ProtectedRoute>
              } />
              <Route path="/discover" element={
                <ProtectedRoute>
                  <DiscoverUsersPage />
                </ProtectedRoute>
              } />
              
              {/* Redirect /auth to /coming-soon for consistency */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
