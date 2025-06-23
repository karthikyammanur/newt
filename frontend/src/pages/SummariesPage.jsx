import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import { mockSummaries } from '../data/mockSummaries';

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

const SummariesPage = () => {
  const location = useLocation();
  // Read topic from query param if present
  const urlParams = new URLSearchParams(location.search);
  const initialTopic = urlParams.get('topic') || topics[0].title;
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Fetch summaries for selected topic
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    fetch(`http://localhost:8000/api/summaries?topic=${encodeURIComponent(selectedTopic)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch summaries');
        return res.json();
      })
      .then(data => setSummaries(data))
      .catch(err => {
        console.log('Using cached mock data due to fetch error:', err);
        // Use mock data when API fails
        if (mockSummaries[selectedTopic]) {
          setSummaries(mockSummaries[selectedTopic]);
          setError(null);
        } else {
          setError(err);
        }
      })
      .finally(() => setIsLoading(false));
  }, [selectedTopic]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) =>
      prev < (summaries?.length ?? 0) - 1 ? prev + 1 : prev
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [summaries?.length]);

  // UI rendering
  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar for topics */}
        <div className="md:w-64 w-full md:sticky md:top-24 mb-8 md:mb-0">
          <div className="flex md:flex-col flex-row gap-4 md:gap-2 overflow-x-auto hide-scrollbar">
            {topics.map((topic) => (
              <motion.button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.title)}
                className={`flex-shrink-0 cursor-pointer px-4 py-3 rounded-xl shadow-md hover:shadow-xl transition-shadow font-semibold text-left
                  ${selectedTopic === topic.title
                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-600 dark:border-blue-400 text-blue-800 dark:text-blue-100'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'}
                `}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {topic.title}
              </motion.button>
            ))}
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                {error.message}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please try again later or contact support if the problem persists.
              </p>
            </div>
          ) : !summaries?.length ? (
            <div className="flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                No summaries available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for fresh tech news summaries.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: direction * 200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -200 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <NewsCard
                    topic={summaries[currentIndex].topic}
                    summary={summaries[currentIndex].summary}
                    timestamp={summaries[currentIndex].timestamp}
                    title={summaries[currentIndex].title}
                    sources={summaries[currentIndex].sources}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`p-2 rounded-full ${
                    currentIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentIndex + 1} / {summaries.length}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === summaries.length - 1}
                  className={`p-2 rounded-full ${
                    currentIndex === summaries.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SummariesPage;
