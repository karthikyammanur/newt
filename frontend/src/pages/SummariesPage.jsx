import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SummariesPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/summaries/today`;
    console.log('Fetching today\'s summaries from URL:', apiUrl);
    console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);
    
    fetch(apiUrl)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch today's summaries: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('Received today\'s summaries data:', data);
        setSummaries(data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, []);  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
                <div className="relative inline-block">
                  <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">
                    Today's Tech News
                  </h1>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
                </div>
                
                <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
                  Fresh summaries updated daily with the latest technology news and insights
                </p>
                
                {/* Stats bar */}
                {summaries?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 inline-flex items-center space-x-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-3"
                  >
                    <div className="flex items-center text-sm text-slate-300">
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {summaries.length} Summaries Available
                    </div>
                    <div className="flex items-center text-sm text-slate-300">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Updated Today
                    </div>
                  </motion.div>
                )}
              </motion.div>              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64"
                >
                  <LoadingSpinner />
                  <p className="text-slate-400 mt-4 text-lg">Loading today's summaries...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center px-4 py-12"
                >
                  <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-8 max-w-md">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-400 mb-3">
                      {error.message}
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Please try again later or contact support if the problem persists.
                    </p>
                  </div>
                </motion.div>
              ) : !summaries?.length ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center px-4 py-12"
                >
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 max-w-md">
                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl font-bold text-slate-300 mb-3">
                      No summaries available for today
                    </h2>
                    <p className="text-slate-400">
                      Check back later for fresh tech news summaries.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {summaries.map((summary, index) => (
                      <motion.div
                        key={`${summary.date}-${index}`}
                        initial={{ opacity: 0, y: 50, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="h-full transform-gpu"
                      >
                        <NewsCard
                          topic={summary.topic}
                          summary={summary.summary}
                          timestamp={summary.date}
                          title={summary.title}
                          sources={summary.sources}
                          summaryId={summary._id}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>              )}
            </div>
          </div>
    </Layout>
  );
};

export default SummariesPage;
