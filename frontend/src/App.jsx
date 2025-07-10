import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import JoinPage from './pages/JoinPage';

// Protected Pages
import SummariesPage from './pages/SummariesPage';
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
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/join" element={<JoinPage />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/summaries" element={
                <ProtectedRoute>
                  <SummariesPage />
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
              
              {/* Redirect /auth to /join for consistency */}
              <Route path="/auth" element={<Navigate to="/join" replace />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
