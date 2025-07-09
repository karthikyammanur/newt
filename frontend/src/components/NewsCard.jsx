import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const NewsCard = ({ topic, summary, timestamp, hideSummary = false, title = '', sources = [] }) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSources, setShowSources] = useState(false);

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

  // Extract sources from summary if not provided
  let summaryText = summary;
  let sourcesList = sources;
  if (!sourcesList.length && summary && summary.includes('Sources:')) {
    const parts = summary.split('Sources:');
    summaryText = parts[0].trim();
    sourcesList = parts[1]
      ? parts[1].split(',').map(s => s.trim()).filter(Boolean)
      : [];
  }

  // Title logic: fallback and truncation
  let displayTitle = title && title.trim() ? title.trim() : 'Untitled Summary';
  if (displayTitle.length > 80) {
    displayTitle = displayTitle.slice(0, 77) + '...';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all relative p-6 text-blue-100"
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
          <span className="inline-block px-3 py-1 bg-blue-800 text-blue-200 text-xs font-semibold rounded-full mb-2 uppercase tracking-wide">
            {topic}
          </span>
          <div className="text-2xl md:text-3xl font-extrabold mb-2 text-white leading-tight">
            {displayTitle}
          </div>
          <div className="text-xs text-blue-300 mb-2">
            {formatDate(timestamp)}
          </div>
        </div>

        {!hideSummary && (
          <div className="mb-6">
            <div className="text-blue-100 whitespace-pre-wrap text-base leading-relaxed">
              {summaryText}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-auto gap-4">
          <div>
            <button
              onClick={() => setShowSources(s => !s)}
              className="flex items-center text-blue-400 hover:text-blue-200 text-sm font-semibold focus:outline-none"
            >
              Sources
              {showSources ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />}
            </button>
            <AnimatePresence>
              {showSources && sourcesList.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 space-y-1 text-xs text-blue-200 bg-gray-800 rounded p-2 shadow-inner"
                >
                  {sourcesList.map((src, i) => (
                    <li key={i} className="truncate">
                      <a href={src} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">
                        {src}
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Share summary"
            >
              <ShareIcon className="h-5 w-5 text-blue-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast notification for copy success */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewsCard;
