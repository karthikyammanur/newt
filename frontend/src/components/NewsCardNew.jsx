import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SummaryModal from './SummaryModal';

const NewsCard = ({ 
  topic, 
  summary, 
  timestamp, 
  hideSummary = false, 
  title = '', 
  sources = [], 
  summaryId = null 
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

  const { markSummaryRead, isAuthenticated } = useAuth();

  const handleViewSources = (e) => {
    e.stopPropagation();
    if (isFlipping) return;
    setIsFlipping(true);
    setIsFlipped(!isFlipped);    setTimeout(() => setIsFlipping(false), 700);
  };

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
    <>
      {/* Regular Card View */}
      <motion.div
        className="h-full"
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.3 }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >        <div 
          className={`relative w-full h-full select-none overflow-hidden transition-all duration-500 card-glow ${
            isFlipped ? 'shadow-2xl' : 'hover:shadow-xl'
          } ${isFlipping ? 'pointer-events-none' : ''}`} 
          style={{ 
            minHeight: '380px',
            perspective: '1000px',
            borderRadius: '20px'
          }}
        >
          {/* Flip loading indicator */}
          {isFlipping && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {/* Front of card */}
          <div 
            className="absolute inset-0 p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 border border-slate-700"
            style={{ 
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              backfaceVisibility: 'hidden',
              transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
              borderRadius: '20px',
              transformStyle: 'preserve-3d'
            }}
          >            <div className="relative mb-4">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                {topic}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold mb-4 text-white leading-tight" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {displayTitle}
            </h3>
            
            {/* Timestamp */}
            <div className="flex items-center text-sm text-blue-300 mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDate(timestamp)}
            </div>
              {/* Summary preview */}
            {!hideSummary && (
              <div 
                className="text-slate-200 text-sm leading-relaxed mb-6 cursor-pointer hover:bg-slate-800/30 rounded-lg p-3 -m-3 transition-colors group" 
                style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
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
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                View sources
              </button>
              
              <div className="flex items-center space-x-2">
                {isAuthenticated && summaryId && (
                  <button
                    onClick={handleMarkAsRead}
                    disabled={hasMarkedAsRead}
                    className={`p-2 rounded-full transition-colors ${
                      hasMarkedAsRead 
                        ? 'bg-green-700/50 text-green-300' 
                        : 'bg-slate-700/50 hover:bg-slate-600/50 text-blue-300'
                    }`}
                    title={hasMarkedAsRead ? 'Already read (+1 point earned)' : 'Mark as read to earn 1 point'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-blue-300"
                  title="Share summary"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Back of card (sources view) */}
          <div 
            className="absolute inset-0 p-6 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 border border-slate-700"
            style={{ 
              transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
              backfaceVisibility: 'hidden',
              transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
              borderRadius: '20px',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="flex items-center mb-6">
              <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-white">Verified Sources</h3>
            </div>
            
            {sourcesList.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {sourcesList.map((src, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <a 
                      href={src.startsWith('http') ? src : `https://${src}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-200 hover:text-purple-300 transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {src.length > 60 ? `${src.substring(0, 60)}...` : src}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400">
                <p className="text-sm">No sources available</p>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4">
              <button
                onClick={handleViewSources}
                className="text-xs text-purple-400 opacity-70 hover:opacity-100"
              >
                ← Back to summary
              </button>
            </div>
          </div>
        </div>
      </motion.div>

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
            className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600 z-50"
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
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
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
            className="fixed bottom-16 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Summary Modal */}
      <SummaryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        topic={topic}
        title={title}
        summary={summary}
        timestamp={timestamp}
        sources={sources}
      />
    </>
  );
};

export default NewsCard;
