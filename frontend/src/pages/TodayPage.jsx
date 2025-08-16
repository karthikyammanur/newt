import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import AccordionSummaryCard from '../components/AccordionSummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const TodayPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const { token } = useAuth();
  
  useEffect(() => {
    const fetchTodaysSummaries = async () => {
      setIsLoading(true);
      setError(null);
        try {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/summaries/today`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch today's summaries: ${response.status} ${response.statusText}`);
        }
          const data = await response.json();
        console.log('Today\'s summaries - Received data:', data);
        
        // The API returns the array directly, not wrapped in a value property
        const summariesArray = Array.isArray(data) ? data : [];
        console.log('Today\'s summaries - Processed array:', summariesArray);
        setSummaries(summariesArray);
      } catch (err) {
        console.error('Error fetching today\'s summaries:', err);
        setError(err);      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysSummaries();
  }, []);
  
  const handleGenerateSummaries = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationResult(null);
    
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/summaries/generate`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      setGenerationResult(result);
      
      if (result.success) {
        // Refresh the summaries list
        const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/summaries/today`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const summariesArray = Array.isArray(data) ? data : [];
          setSummaries(summariesArray);
        }
      }
    } catch (err) {
      console.error('Error generating summaries:', err);
      setGenerationResult({
        success: false,
        message: `Error: ${err.message}`
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
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
                
                {/* Manual generation button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6"
                >
                  <button
                    onClick={handleGenerateSummaries}
                    disabled={isGenerating}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-full 
                      transition-all duration-200 shadow-lg focus:outline-none
                      ${isGenerating 
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:shadow-indigo-500/30'}
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Generate New Summaries
                      </>
                    )}
                  </button>
                </motion.div>
                
                {/* Generation result message */}
                {generationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 text-sm px-4 py-2 rounded-full inline-block ${
                      generationResult.success 
                        ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                        : 'bg-red-900/50 text-red-300 border border-red-700/50'
                    }`}
                  >
                    {generationResult.message}
                  </motion.div>
                )}
                
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
              </motion.div>              {(() => {
                if (isLoading) {
                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64"
                    >
                      <LoadingSpinner />
                      <p className="text-slate-400 mt-4 text-lg">Loading today's summaries...</p>
                    </motion.div>
                  );
                }
                
                if (error) {
                  return (
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
                  );
                }
                  if (!summaries?.length) {
                  return <AccordionSummaryCard summaries={[]} />;
                }
                  return (
                  <AccordionSummaryCard summaries={summaries} />
                );
              })()}
            </div>
          </div>
    </Layout>
  );
};

export default TodayPage;
