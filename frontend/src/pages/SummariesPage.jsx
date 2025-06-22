import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const fetchSummaries = async (token) => {
  const response = await fetch('http://localhost:8000/api/summaries', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch summaries');
  }
  return response.json();
};

const SummariesPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [likedIds, setLikedIds] = useState([]);
  const { user } = useAuth();
  
  const { data: summaries, isLoading, error } = useQuery({
    queryKey: ['summaries'],
    queryFn: () => fetchSummaries(localStorage.getItem('token')),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
    enabled: !!localStorage.getItem('token')
  });

  // Fetch liked article IDs on mount
  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:8000/api/likes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLikedIds(data.liked || []);
      }
    };
    fetchLikes();
  }, []);

  const handleLike = async (articleId) => {
    setLikedIds((prev) => [...prev, articleId]);
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/like/${articleId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

  const handleUnlike = async (articleId) => {
    setLikedIds((prev) => prev.filter((id) => id !== articleId));
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/unlike/${articleId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

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

  if (isLoading) return (
    <Layout>
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error.message}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please try again later or contact support if the problem persists.
        </p>
      </div>
    </Layout>
  );

  if (!summaries?.length) return (
    <Layout>
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          No summaries available
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for fresh tech news summaries.
        </p>
      </div>
    </Layout>
  );

  const currentSummary = summaries[currentIndex];
  const articleId = currentSummary.id || currentSummary.topic; // fallback to topic if no id

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
                topic={currentSummary.topic}
                summary={currentSummary.summary}
                timestamp={currentSummary.timestamp}
                isLiked={likedIds.includes(articleId)}
                onLike={() => handleLike(articleId)}
                onUnlike={() => handleUnlike(articleId)}
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
        </div>
      </div>
    </Layout>
  );
};

export default SummariesPage;
