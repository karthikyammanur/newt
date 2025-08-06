import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ReelViewer = ({ summaries = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [sourcesData, setSourcesData] = useState([]);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [readStatuses, setReadStatuses] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const { markSummaryRead, isAuthenticated } = useAuth();
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  const currentSummary = summaries[currentIndex];

  // Handle navigation
  const navigateToIndex = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < summaries.length && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(newIndex);
      setTimeout(() => setIsScrolling(false), 300);
    }
  }, [summaries.length, isScrolling]);

  const navigateUp = useCallback(() => {
    navigateToIndex(currentIndex - 1);
  }, [currentIndex, navigateToIndex]);

  const navigateDown = useCallback(() => {
    navigateToIndex(currentIndex + 1);
  }, [currentIndex, navigateToIndex]);

  // Handle wheel scroll
  const handleWheel = useCallback((e) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 300) return; // Throttle
    
    lastScrollTime.current = now;
    if (e.deltaY > 0) {
      navigateDown();
    } else {
      navigateUp();
    }
  }, [navigateUp, navigateDown]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateUp, navigateDown, onClose]);

  // Handle mouse drag
  const handleMouseDown = (e) => {
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e) => {
    const deltaY = touchStartY.current - e.clientY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        navigateDown();
      } else {
        navigateUp();
      }
    }
  };

  // Handle read button
  const handleMarkAsRead = async () => {
    if (!isAuthenticated || !currentSummary?._id || readStatuses[currentSummary._id]) return;

    const result = await markSummaryRead(currentSummary._id);
    if (result.success) {
      setReadStatuses(prev => ({ ...prev, [currentSummary._id]: true }));
    }
  };

  // Handle sources modal
  const handleShowSources = () => {
    setSourcesData(currentSummary?.sources || []);
    setShowSourcesModal(true);
  };

  // Handle share
  const handleShare = async () => {
    if (!currentSummary) return;

    const shareText = `${currentSummary.title}\n\n${currentSummary.summary}\n\nSources: ${currentSummary.sources?.join(', ') || 'N/A'}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!summaries.length || !currentSummary) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Navigation Controls - Top Left */}
      <div className="fixed top-6 left-6 z-30 flex flex-col gap-2">
        <motion.button
          onClick={navigateUp}
          disabled={currentIndex === 0}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
        
        <motion.button
          onClick={navigateDown}
          disabled={currentIndex === summaries.length - 1}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {/* Progress indicator */}
        <div className="mt-2 text-white/70 text-sm text-center">
          {currentIndex + 1} / {summaries.length}
        </div>
      </div>

      {/* Close Button - Top Right */}
      <motion.button
        onClick={onClose}
        className="fixed top-6 right-6 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-screen w-full flex flex-col"
        >
          {/* Image Section */}
          <div className="h-1/2 w-full relative overflow-hidden">
            {currentSummary.urlToImage ? (
              <img
                src={currentSummary.urlToImage}
                alt={currentSummary.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback placeholder */}
            <div 
              className={`w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white ${currentSummary.urlToImage ? 'hidden' : 'flex'}`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">📰</div>
                <div className="text-xl font-semibold px-4">
                  {currentSummary.topic || 'Tech News'}
                </div>
              </div>
            </div>

            {/* Topic badge overlay */}
            <div className="absolute top-6 left-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full uppercase tracking-wider shadow-lg">
                {currentSummary.topic || 'Tech'}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="h-1/2 bg-gradient-to-b from-slate-900 to-black text-white p-8 overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-bold mb-6 leading-tight">
              {currentSummary.title}
            </h1>
            
            <div className="text-lg leading-relaxed text-slate-200 mb-6">
              {currentSummary.summary}
            </div>

            {/* Timestamp */}
            {currentSummary.date && (
              <div className="text-slate-400 text-sm">
                {new Date(currentSummary.date).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Right Side Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-4">
        {/* Read Button */}
        <motion.button
          onClick={handleMarkAsRead}
          disabled={!isAuthenticated || readStatuses[currentSummary?._id]}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors ${
            readStatuses[currentSummary?._id] 
              ? 'bg-green-600/80' 
              : 'bg-blue-600/80 hover:bg-blue-700/80'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {readStatuses[currentSummary?._id] ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </motion.button>

        {/* Sources Button */}
        <motion.button
          onClick={handleShowSources}
          className="w-14 h-14 bg-purple-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-700/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </motion.button>

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          className="w-14 h-14 bg-green-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-700/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </motion.button>
      </div>

      {/* Sources Modal */}
      <AnimatePresence>
        {showSourcesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            onClick={() => setShowSourcesModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Sources</h3>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {sourcesData.length > 0 ? (
                  sourcesData.map((source, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-lg">
                      <a
                        href={source.startsWith('http') ? source : `https://${source}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all"
                      >
                        {source}
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No sources available</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Toast */}
      <AnimatePresence>
        {showCopiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelViewer;
