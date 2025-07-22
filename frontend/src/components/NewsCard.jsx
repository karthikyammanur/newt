import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './CardAnimations.css';
import useAnimationRecovery from '../hooks/useAnimationRecovery';
import SummaryModal from './SummaryModal';

const NewsCard = ({
  topic,
  summary,
  timestamp,
  hideSummary = false,
  title = '',
  sources = [],
  summaryId = null,
  urlToImage = '',
  showImages = true
}) => {
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const [showPointsEarned, setShowPointsEarned] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);
  const [showStreakUpdate, setShowStreakUpdate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce ref to prevent rapid clicks
  const clickTimeoutRef = useRef(null);
  const { markSummaryRead, isAuthenticated } = useAuth();

  const handleViewSources = useCallback((e) => {
    // Always stop propagation and prevent default to avoid bubbling
    e.stopPropagation();
    e.preventDefault();

    // Prevent flipping when already flipping or during debounce
    if (isFlipping || clickTimeoutRef.current) return;

    // Create a temporary lock to prevent multiple clicks
    clickTimeoutRef.current = true;

    // Apply a CSS class to indicate flipping state for visual feedback
    const card = e.currentTarget.closest('.card-3d-wrapper');
    if (card) card.classList.add('is-flipping');

    // Set flipping state first to prevent further interactions
    setIsFlipping(true);
    // Schedule flip with requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Store timeout ref for cleanup
      flipTimerRef.current = setTimeout(() => {
        setIsFlipped(!isFlipped);

        // Reset flipping state after animation completes
        flipTimerRef.current = setTimeout(() => {
          setIsFlipping(false);
          if (card) card.classList.remove('is-flipping');
          clickTimeoutRef.current = null; // Release the lock
        }, 800); // Match the transition duration
      }, 10); // Short delay for browser painting
    });
  }, [isFlipping, isFlipped]);

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

  const handleEnlargeSummary = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !summaryId || hasMarkedAsRead) return;

    const result = await markSummaryRead(summaryId);
    if (result.success) {
      setHasMarkedAsRead(true);

      if (result.streak && result.streak.updated) {
        setStreakInfo(result.streak);
        setShowStreakUpdate(true);
        setTimeout(() => setShowStreakUpdate(false), 4000);
      }

      if (result.pointsEarned > 0) {
        setShowPointsEarned(true);
        setTimeout(() => setShowPointsEarned(false), 3000);
      } else if (result.alreadyRead) {
        setErrorMessage('Already read - no points awarded');
        setTimeout(() => setErrorMessage(""), 2500);
      }
    } else {
      setErrorMessage(result.error || 'Failed to mark as read');
      setTimeout(() => setErrorMessage(""), 2500);
    }
  };

  // Refs for transition and animation control
  const flipTimerRef = useRef(null);

  // Clean up all timers and state when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timers to prevent memory leaks
      if (typeof clickTimeoutRef.current === 'number') {
        clearTimeout(clickTimeoutRef.current);
      }
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);

      // Reset all refs
      clickTimeoutRef.current = null;
      flipTimerRef.current = null;
    };
  }, []);

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

  // Handle sources being a string instead of array
  let sourcesList = sources;
  if (typeof sources === 'string') {
    sourcesList = sources ? [sources] : [];
  } else if (!Array.isArray(sources)) {
    sourcesList = [];
  }

  // Extract sources from summary if not provided
  let summaryText = summary;
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
    <>      {/* Regular Card View */}
      <motion.div
        className="h-full"
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className={`relative w-full h-full select-none overflow-hidden transition-all duration-500 card-glow ${isFlipped ? 'shadow-2xl' : 'hover:shadow-xl'
            } ${isFlipping ? 'pointer-events-none' : ''} card-3d-wrapper`}
          style={{
            minHeight: '380px',
            perspective: '1000px',
            borderRadius: '20px',
            contain: 'layout paint size',
            isolation: 'isolate'
          }}
        >
          {/* Flip loading indicator */}
          {isFlipping && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {/* Front of card */}        <div
            className="absolute inset-0 p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 border border-slate-700 card-face card-front"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              backfaceVisibility: 'hidden',
              transition: 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
              borderRadius: '20px',
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity', // Hardware acceleration for both transform and opacity
              contain: 'content', // Improve rendering performance
              perspective: '1000px' // Consistent perspective
            }}
          >            {/* Topic Badge with enhanced styling */}
            <div className="relative mb-4 flex items-center justify-between">
              <div className="relative">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                  {topic}
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
              </div>
              {/* Sources counter badge */}
              {sourcesList.length > 0 && (
                <div className="flex items-center space-x-1 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-blue-300 font-medium">{sourcesList.length}</span>
                </div>)}
            </div>            {/* Article Image - only show if showImages is true */}
            {showImages && urlToImage && (
              <div className="mb-4 overflow-hidden rounded-xl">
                <img
                  src={urlToImage}
                  alt={displayTitle || topic}
                  className={`w-full object-cover rounded-xl transition-all duration-500 ${
                    isFlipped 
                      ? 'h-64 object-contain bg-slate-800' 
                      : 'h-40 object-cover hover:scale-105'
                  }`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {showImages && !urlToImage && (
              <div className="mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 shadow-lg">
                <div className={`w-full flex items-center justify-center text-slate-400 transition-all duration-500 ${
                  isFlipped ? 'h-64' : 'h-40'
                }`}>
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-slate-300">No image available</p>
                    <p className="text-xs text-slate-500 mt-1">{topic.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Title with better typography */}
            <h3 className="text-2xl font-bold mb-4 text-white leading-tight" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {displayTitle}
            </h3>

            {/* Timestamp with icon */}
            <div className="flex items-center text-sm text-blue-300 mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDate(timestamp)}
            </div>
            {/* Summary with better spacing */}
            {!hideSummary && (
              <div
                className="text-slate-200 text-sm leading-relaxed mb-6 cursor-pointer hover:bg-slate-800/30 rounded-lg p-3 -m-3 transition-colors group"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 7,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.6'
                }}
                onClick={handleEnlargeSummary}
                title="Click to read full summary"
              >
                {summaryText}
                {/* Enlarge indicator */}
                <div className="mt-2 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a2 2 0 012-2h2M4 16v4a2 2 0 002 2h2m8-20h2a2 2 0 012 2v4m0 8v4a2 2 0 01-2 2h-2" />
                  </svg>
                  Click to expand
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <button
                onClick={handleViewSources}
                className="flex items-center text-xs text-blue-400 opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                View sources
              </button>

              <div className="flex items-center space-x-2">
                {isAuthenticated && summaryId && (
                  <button
                    onClick={handleMarkAsRead}
                    disabled={hasMarkedAsRead}
                    className={`p-2 rounded-full transition-colors ${hasMarkedAsRead
                        ? 'bg-green-700/50 text-green-300'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-blue-300'
                      }`}
                    title={hasMarkedAsRead ? 'Already read (+1 point earned)' : 'Mark as read to earn 1 point'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-blue-300"
                  title="Share summary"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Back of card */}        <div
            className="absolute inset-0 p-6 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 border border-slate-700 card-face card-back"
            style={{
              transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
              backfaceVisibility: 'hidden',
              transition: 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
              borderRadius: '20px',
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity', // Hardware acceleration for both transform and opacity
              contain: 'content', // Improve rendering performance
              perspective: '1000px' // Consistent perspective
            }}
          >
            {/* Header with icon */}
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Verified Sources</h3>
            </div>

            {/* Sources list with enhanced styling */}
            {sourcesList.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                {sourcesList.map((src, i) => (
                  <div key={i} className="group">
                    <div className="flex items-start p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 group-hover:bg-purple-300"></div>
                      <a
                        href={src.startsWith('http') ? src : `https://${src}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-200 hover:text-purple-300 transition-colors duration-200 text-sm leading-relaxed flex-1 group-hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {src.length > 60 ? `${src.substring(0, 60)}...` : src}
                      </a>
                      <svg className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors duration-200 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">No sources available</p>
                </div>
              </div>
            )}

            {/* Back flip indicator */}
            <div className="absolute bottom-4 right-4 flex items-center text-xs text-purple-400 opacity-70">
              <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H5a7.001 7.001 0 006.929-6.071 1 1 0 011.962.308A8.99 8.99 0 0115 12.07l2.707-2.707a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Back to summary          </div>
          </div>
        </div>    </motion.div>

      {/* Toast notifications */}
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

      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPointsEarned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            +1 point earned!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakUpdate && streakInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">🔥</span>
            <div>
              <div className="font-semibold">Reading Streak!</div>
              <div className="text-sm">
                Current: {streakInfo.current} days
                {streakInfo.current === streakInfo.max && streakInfo.current > 1 && (
                  <span className="ml-1 text-yellow-300">🏆 Personal Best!</span>
                )}
              </div>
            </div>        </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        summary={summary}
        title={title}
        topic={topic}
        sources={sources}
        timestamp={timestamp}
      />
    </>
  );
};

export default NewsCard;
