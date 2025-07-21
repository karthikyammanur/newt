import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CardAnimations.css';
import useAnimationRecovery from '../hooks/useAnimationRecovery';
import SummaryModal from './SummaryModal';

const FixedSummaryCard = ({ 
  topic, 
  summary, 
  timestamp, 
  title = '', 
  sources = [], 
  summaryId = null 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Single ref for preventing rapid clicks
  const isProcessingRef = useRef(false);
  const flipTimerRef = useRef(null);
  const handleFlip = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent flipping when already flipping or processing
    if (isFlipping || isProcessingRef.current || isAnimating) return;
    
    // Set processing lock and flipping state
    isProcessingRef.current = true;
    setIsFlipping(true);
    
    // Clear any existing timer
    if (flipTimerRef.current) {
      clearTimeout(flipTimerRef.current);
    }
    
    // Schedule flip
    flipTimerRef.current = setTimeout(() => {
      setIsFlipped(prev => !prev);
      
      // Reset flipping state after animation
      setTimeout(() => {
        setIsFlipping(false);
        isProcessingRef.current = false;
      }, 600); // Match CSS transition duration
    }, 50); // Small delay for smooth animation start
  }, [isFlipping, isAnimating]);  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        clearTimeout(flipTimerRef.current);
      }
      isProcessingRef.current = false;
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

  const handleEnlargeSummary = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle sources being a string instead of array
  let sourcesList = sources;
  if (typeof sources === 'string') {
    sourcesList = sources ? [sources] : [];
  } else if (!Array.isArray(sources)) {
    sourcesList = [];
  }

  // Title logic: fallback and truncation
  let displayTitle = title && title.trim() ? title.trim() : 'Untitled Summary';
  if (displayTitle.length > 80) {
    displayTitle = displayTitle.slice(0, 77) + '...';  }

  return (
    <>
      {/* Regular Card View */}      <motion.div
        className="h-full"
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div 
          className={`relative w-full h-full select-none overflow-hidden transition-all duration-500 card-glow ${
            isFlipped ? 'shadow-2xl' : 'hover:shadow-xl'
          } ${isAnimating ? 'pointer-events-none opacity-0' : ''} card-3d-wrapper`}
          style={{ 
            minHeight: '380px',
            perspective: '1000px',
            borderRadius: '20px',
            contain: 'layout style',
            isolation: 'isolate'
          }}
        >{/* Front of card */}
        <div 
          className="absolute inset-0 p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 border border-slate-700 card-face card-front"
          style={{ 
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
            borderRadius: '20px',
            transformStyle: 'preserve-3d'
          }}
        >          {/* Topic Badge with enhanced styling */}
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
              </div>
            )}
          </div>
          
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
            {summary}
            {/* Enlarge indicator */}
            <div className="mt-2 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a2 2 0 012-2h2M4 16v4a2 2 0 002 2h2m8-20h2a2 2 0 012 2v4m0 8v4a2 2 0 01-2 2h-2" />
              </svg>
              Click to expand
            </div>
          </div>{/* Flip indicator with animation */}
          <button
            onClick={handleFlip}
            disabled={isFlipping || isAnimating}
            className={`absolute bottom-4 right-4 flex items-center text-xs transition-colors ${
              isFlipping || isAnimating
                ? 'text-blue-600 cursor-not-allowed opacity-50' 
                : 'text-blue-400 opacity-70 hover:opacity-100'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            View sources
          </button></div>
          {/* Back of card */}
        <div 
          className="absolute inset-0 p-6 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 border border-slate-700 card-face card-back"          
          style={{ 
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            backfaceVisibility: 'hidden',
            transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
            borderRadius: '20px',
            transformStyle: 'preserve-3d'
          }}
        >{/* Header with icon */}
          <div className="flex items-center mb-6">
            <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
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
          <button
            onClick={handleFlip}
            disabled={isFlipping}
            className={`absolute bottom-4 right-4 flex items-center text-xs transition-colors ${
              isFlipping 
                ? 'text-purple-600 cursor-not-allowed' 
                : 'text-purple-400 opacity-70 hover:opacity-100'
            }`}
          >
            <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L2.586 11H5a7.001 7.001 0 006.929-6.071 1 1 0 011.962.308A8.99 8.99 0 0115 12.07l2.707-2.707a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>            Back to summary
          </button>        </div>
      </div>
      </motion.div>

      {/* Summary Modal */}
      <SummaryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={title}
        topic={topic}
        summary={summary}
        timestamp={timestamp}
        sources={sources}
      />
    </>
  );
};

export default FixedSummaryCard;
