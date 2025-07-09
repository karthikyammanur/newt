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
  }, []);
  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Today's Tech News
            </h1>
            <p className="text-blue-300 text-lg">
              Fresh summaries updated daily with the latest technology news
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                {error.message}
              </h2>
              <p className="text-blue-300">
                Please try again later or contact support if the problem persists.
              </p>
            </motion.div>
          ) : !summaries?.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="text-2xl font-bold text-blue-300 mb-4">
                No summaries available for today
              </h2>
              <p className="text-blue-400">
                Check back later for fresh tech news summaries.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {summaries.map((summary, index) => (
                <motion.div
                  key={`${summary.date}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <NewsCard
                    topic={summary.topic}
                    summary={summary.summary}
                    timestamp={summary.date}
                    title={summary.title}
                    sources={summary.sources}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {summaries?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12 text-blue-400"
            >
              <p>
                Showing {summaries.length} summaries for today • 
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SummariesPage;
