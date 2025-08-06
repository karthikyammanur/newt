import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReelViewer from '../components/ReelViewer';
import LoadingSpinner from '../components/LoadingSpinner';

const ReelsPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/summaries/today`;
    console.log('Fetching summaries for reel view from URL:', apiUrl);
    
    fetch(apiUrl)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch summaries: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('Received summaries data for reels:', data);
        setSummaries(data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleClose = () => {
    navigate('/summaries');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (error || !summaries?.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md"
        >
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-3">
              {error ? 'Error loading reels' : 'No summaries available'}
            </h2>
            <p className="text-slate-400 mb-6">
              {error ? error.message : 'Check back later for fresh tech news summaries.'}
            </p>
            <motion.button
              onClick={handleClose}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-full transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Summaries
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ReelViewer
      summaries={summaries}
      onClose={handleClose}
    />
  );
};

export default ReelsPage;
