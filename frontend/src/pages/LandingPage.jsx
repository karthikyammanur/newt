import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const topics = [
  { id: 1, title: 'machine learning' },
  { id: 2, title: 'semiconductors' },
  { id: 3, title: 'startups' },
  { id: 4, title: 'programming languages' },
  { id: 5, title: 'web development' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(topics[0].title);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Listen for dark mode changes
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Fetch cached summaries for selected topic
    setLoading(true);
    fetch(`http://localhost:8000/api/summaries?topic=${encodeURIComponent(selectedTopic)}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setSummaries(data))
      .finally(() => setLoading(false));
  }, [selectedTopic]);

  const handleScroll = (direction) => {
    const container = document.getElementById('topics-container');
    const scrollAmount = direction === 'left' ? -300 : 300;
    if (container) {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  const backgroundStyle = darkMode
    ? { background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, #232946 0%, #121212 100%)` }
    : { background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))` };

  return (
    <div className={`min-h-screen relative overflow-hidden ${darkMode ? 'dark' : ''}`}> 
      <motion.div
        className="absolute inset-0 transition-all duration-300"
        style={backgroundStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.h1
          className={`text-6xl md:text-8xl font-bold mb-4 ${darkMode ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          NEWT
        </motion.h1>
        <motion.p
          className={`text-xl md:text-2xl mb-8 text-center ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          summarizing the world of tech, one byte at a time.
        </motion.p>
        <motion.button
          onClick={() => navigate('/summaries')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors mb-8 shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Reading
        </motion.button>
        {/* Topic filter bar */}
        <div className="w-full max-w-6xl relative mb-8">
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
          </button>
          <div
            id="topics-container"
            className="overflow-x-auto hide-scrollbar flex gap-4 px-12"
          >
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.title)}
                className={`flex-shrink-0 cursor-pointer p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow
                  ${selectedTopic === topic.title
                    ? darkMode
                      ? 'bg-blue-900 border-2 border-blue-400 text-blue-100'
                      : 'bg-blue-100 border-2 border-blue-600 text-blue-800'
                    : darkMode
                      ? 'bg-gray-800 text-gray-200'
                      : 'bg-white text-gray-800'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3 className="text-lg font-semibold">
                  {topic.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
        {/* Summaries for selected topic */}
        <div className="w-full max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-lg text-gray-500 dark:text-gray-300">Loading summaries...</span>
            </div>
          ) : summaries.length ? (
            summaries.map((summary, idx) => (
              <div key={idx} className={`mb-6 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-900 text-blue-100' : 'bg-gray-50 text-gray-900'}`}>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide opacity-70">{selectedTopic}</div>
                <div className="mb-2 whitespace-pre-line">{summary.summary}</div>
                <div className="text-xs text-gray-400 mt-2">{summary.timestamp && new Date(summary.timestamp).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-300">No summaries available for this topic.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
