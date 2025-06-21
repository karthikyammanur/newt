import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SummariesPage from './pages/SummariesPage';
import AuthPage from './pages/AuthPage';
import LoadingScreen from './components/LoadingScreen';
import DarkModeToggle from './components/DarkModeToggle';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DevToolsNote from './components/DevToolsNote';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prefetch summaries
    queryClient.prefetchQuery({
      queryKey: ['summaries'],
      queryFn: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/summaries', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Failed to fetch summaries');
        return response.json();
      },
    });

    // Show loading screen for at least 1 second
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <LoadingScreen key="loading" />
              ) : (
                <>
                  <DarkModeToggle />
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route 
                      path="/summaries" 
                      element={
                        <PrivateRoute>
                          <SummariesPage />
                        </PrivateRoute>
                      } 
                    />
                    <Route path="/auth" element={<AuthPage />} />
                  </Routes>
                  <DevToolsNote />
                </>
              )}
            </AnimatePresence>
          </Router>
        </AuthProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;
