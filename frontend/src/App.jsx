import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import SummariesPage from './pages/SummariesPage';
import PastSummariesPage from './pages/PastSummariesPage';
import PastSummariesTopicPage from './pages/PastSummariesTopicPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './styles/globals.css';

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
          <AnimatePresence mode="wait">            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/summaries" element={<SummariesPage />} />
              <Route path="/past-summaries" element={<PastSummariesPage />} />
              <Route path="/past-summaries/:topic" element={<PastSummariesTopicPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
