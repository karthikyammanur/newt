import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const NewsCard = ({ topic, summary, timestamp, isLiked, onLike = () => {}, onUnlike = () => {}, hideSummary = false }) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      setErrorMessage('Failed to copy to clipboard.');
      setTimeout(() => setErrorMessage(""), 2500);
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLikeClick = () => {
    try {
      if (isLiked) {
        onUnlike();
      } else {
        onLike();
      }
    } catch (err) {
      setErrorMessage('Failed to update like. Please try again.');
      setTimeout(() => setErrorMessage(""), 2500);
      console.error('Like/unlike error:', err);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (err) {
      console.error('Invalid date:', err);
      return 'Recent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all relative p-6"
    >
      {/* Error Toast Notification */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium rounded-full mb-3">
            {topic}
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {formatDate(timestamp)}
          </div>
        </div>

        {!hideSummary && (
          <div className="prose dark:prose-invert max-w-none mb-6">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}

        <div className="flex justify-end items-center mt-auto gap-4">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Share summary"
          >
            <ShareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={handleLikeClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isLiked ? 'Unlike summary' : 'Like summary'}
          >
            {isLiked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Toast notification for copy success */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewsCard;
