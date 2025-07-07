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

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Choose a topic to view past summaries
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {topics.map((topic) => (
            <motion.button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.title)}
              className="bg-gray-900 border-2 border-blue-800 rounded-xl p-6 text-lg font-semibold hover:bg-blue-900 transition-colors text-blue-100 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {topic.title}
            </motion.button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PastSummariesPage;
