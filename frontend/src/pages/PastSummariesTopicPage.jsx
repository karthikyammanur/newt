import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';

const PastSummariesTopicPage = () => {
  const { topic } = useParams();
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/past_summaries?topic=${encodeURIComponent(topic)}`;
    console.log('Past summaries - Fetching from URL:', apiUrl);
    console.log('Past summaries - VITE_API_URL env var:', import.meta.env.VITE_API_URL);
    
    fetch(apiUrl)
      .then(res => {
        console.log('Past summaries - Response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch past summaries: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        console.log('Past summaries - Received data:', data);
        setSummaries(data);
      })
      .catch(err => {
        console.error('Past summaries - Fetch error:', err);
        setError(err);
      })
      .finally(() => setIsLoading(false));
  }, [topic]);  return (
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
                  <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6 capitalize">
                    {topic} Summaries
                  </h1>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
                </div>
                
                <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
                  Past summaries for {topic}
                </p>
              </motion.div>

              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-64"
                >
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 text-lg">Loading past summaries...</p>
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
                      Please try again later or go back to topic selection.
                    </p>
                  </div>
                </motion.div>
              ) : !summaries.length ? (
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
                      No past summaries found
                    </h2>
                    <p className="text-slate-400">
                      No past summaries found for this topic.
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
                        key={summary._id || index}
                        initial={{ opacity: 0, y: 50, rotateX: -15 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        className="h-full transform-gpu"
                      >                        <NewsCard
                          topic={summary.topic}
                          summary={summary.summary}
                          timestamp={summary.timestamp}
                          title={summary.title}
                          sources={summary.sources}
                          summaryId={summary._id}
                          hideSummary={false}
                          showImages={false}
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

export default PastSummariesTopicPage;
