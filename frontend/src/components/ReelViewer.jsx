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
      {/* Full-height container with Instagram/YouTube Shorts style UI */}
      <div className="h-full w-full flex items-center justify-center relative">
        {/* Main Content - Reel Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full max-w-[600px] mx-auto flex items-center"
          >
            {/* Card with shadow and rounded corners */}
            <div className="w-full mx-2 sm:mx-4 rounded-xl shadow-lg bg-slate-900 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
              {/* Image Header */}
              <div className="w-full h-[200px] sm:h-[250px] relative">
                {currentSummary.urlToImage ? (
                  <img
                    src={currentSummary.urlToImage}
                    alt={currentSummary.title}
                    className="w-full h-full object-cover rounded-t-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center rounded-t-xl">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📰</div>
                      <div className="text-xl font-bold px-4 text-white">
                        {currentSummary.topic || 'Tech News'}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Topic badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow-md">
                    {currentSummary.topic || 'Tech'}
                  </span>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-800">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                  {currentSummary.title}
                </h2>
                
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 line-clamp-4">
                  {currentSummary.summary}
                </p>
                
                {/* Date and source */}
                <div className="flex justify-between items-center text-gray-400 text-xs pt-3 sm:pt-4 border-t border-gray-700">
                  <div>
                    {currentSummary.sources && currentSummary.sources.length > 0 && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">
                          Source: {currentSummary.sources[0]}
                        </span>
                      </span>
                    )}
                  </div>
                  <div>
                    {currentSummary.date && (
                      <time className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(currentSummary.date).toLocaleString()}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation indicators */}
        <div className="absolute top-4 left-0 right-0 z-10 px-4 sm:px-6">
          <div className="flex space-x-1">
            {summaries.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Close Button - Top Right */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white bg-black/40 backdrop-blur-sm rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        {/* Top Left: Navigation buttons */}
        <div className="absolute left-3 sm:left-4 top-16 sm:top-20 z-20 flex flex-col space-y-2 sm:space-y-3">
          <motion.button
            onClick={navigateUp}
            disabled={currentIndex === 0 || isScrolling}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={navigateDown}
            disabled={currentIndex === summaries.length - 1 || isScrolling}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
          
          {/* Counter */}
          <div className="text-white text-center text-xs sm:text-sm bg-black/40 backdrop-blur-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg shadow-lg">
            {currentIndex + 1} / {summaries.length}
          </div>
        </div>
        
        {/* Right side of card: Action buttons */}
        <div className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 sm:space-y-6 z-20">
          {/* Read Button */}
          <motion.button
            onClick={handleMarkAsRead}
            disabled={!isAuthenticated || readStatuses[currentSummary?._id]}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg ${
              readStatuses[currentSummary?._id] 
                ? 'bg-green-600/90 backdrop-blur-sm' 
                : 'bg-black/50 backdrop-blur-sm hover:bg-black/70'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {readStatuses[currentSummary?._id] ? (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] sm:text-xs mt-1">Read</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-[10px] sm:text-xs mt-1">Read</span>
              </>
            )}
          </motion.button>

          {/* Sources Button */}
          <motion.button
            onClick={handleShowSources}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-black/50 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-white hover:bg-black/70 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-[10px] sm:text-xs mt-1">Sources</span>
          </motion.button>

          {/* Share Button */}
          <motion.button
            onClick={handleShare}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-black/50 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-white hover:bg-black/70 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-[10px] sm:text-xs mt-1">Share</span>
          </motion.button>
        </div>
      </div>

      {/* Sources Modal */}
      <AnimatePresence>
        {showSourcesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowSourcesModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full max-h-[70vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white">Sources</h3>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {sourcesData.length > 0 ? (
                  sourcesData.map((source, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <a
                        href={source.startsWith('http') ? source : `https://${source}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 break-all text-sm sm:text-base flex items-start"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>{source}</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-700 rounded-lg text-center">
                    <p className="text-slate-400 text-sm sm:text-base">No sources available</p>
                  </div>
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
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-xl flex items-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelViewer;
