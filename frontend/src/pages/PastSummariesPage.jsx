import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const topics = [
  { id: 1, title: 'machine learning' },
  { id: 2, title: 'semiconductors' },
  { id: 3, title: 'startups' },
  { id: 4, title: 'programming languages' },
  { id: 5, title: 'web development' },
  { id: 6, title: 'artificial intelligence' },
  { id: 7, title: 'software engineering' },
  { id: 8, title: 'cloud computing' },
  { id: 9, title: 'cybersecurity' },
  { id: 10, title: 'data science' }
];

const PastSummariesPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (selectedTopic) {
      navigate(`/past-summaries/${encodeURIComponent(selectedTopic)}`);
    }
  }, [selectedTopic, navigate]);
  return (    <Layout>
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
                    Past Summaries
                  </h1>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
                </div>
                
                <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                  Choose a topic to explore previous tech news summaries
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {topics.map((topic, index) => (
                  <motion.button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.title)}
                    className="group relative bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 border border-slate-700 rounded-2xl p-6 text-left hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                        <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-2 capitalize group-hover:text-blue-300 transition-colors duration-300">
                        {topic.title}
                      </h3>
                      
                      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                        View past summaries
                      </p>
                    </div>
                  </motion.button>
                ))}              </motion.div>
            </div>
          </div>
    </Layout>
  );
};

export default PastSummariesPage;
