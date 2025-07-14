import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const SummaryCard = ({ 
  topic, 
  summary, 
  timestamp, 
  title = '', 
  sources = [], 
  summaryId = null 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);  const [showPointsEarned, setShowPointsEarned] = useState(false);
  const [rippleEffect, setRippleEffect] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

  // Safe hook usage with fallback
  let isAuthenticated = false;
  let markSummaryRead = null;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    markSummaryRead = auth.markSummaryRead;
  } catch (error) {
    // AuthProvider not available, use defaults
    console.warn('AuthProvider not available, using defaults');
  }
  
  const handleFlip = (e) => {
    // Create ripple effect at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipplePosition({ x, y });
    setRippleEffect(true);
    
    // Flip the card
    setIsFlipped(!isFlipped);
    
    // Reset ripple effect after animation completes
    setTimeout(() => setRippleEffect(false), 600);
  };
    const handleMarkAsRead = async (e) => {
    e.stopPropagation(); // Prevent card flip when clicking on the mark as read button
    
    if (!isAuthenticated || !summaryId || hasMarkedAsRead || !markSummaryRead) return;

    try {
      const result = await markSummaryRead(summaryId);
      if (result.success) {
        setHasMarkedAsRead(true);
        
        if (result.pointsEarned > 0) {
          setShowPointsEarned(true);
          setTimeout(() => setShowPointsEarned(false), 3000);
        }
      }
    } catch (error) {
      console.error('Error marking summary as read:', error);
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
  // Extract sources from summary if not provided or handle string format
  let summaryText = summary;
  let sourcesList = sources;
  
  // Handle sources being a string instead of array
  if (typeof sources === 'string') {
    sourcesList = sources ? [sources] : [];
  } else if (!Array.isArray(sources)) {
    sourcesList = [];
  }
  
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
      className="h-full"
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div 
        className={`relative w-full h-full select-none cursor-pointer rounded-xl shadow-lg overflow-hidden transition-all duration-700 perspective-1000 transform-style-3d ${
          isFlipped ? 'shadow-xl' : 'hover:shadow-xl'
        }`} 
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 p-6 rounded-xl bg-gray-900 transform backface-hidden transition-transform duration-700 ${
            isFlipped ? 'rotate-y-180' : ''
          } ${hasMarkedAsRead ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
        >
          <span className="inline-block px-3 py-1 bg-blue-800 text-blue-200 text-xs font-semibold rounded-full mb-2 uppercase tracking-wide">
            {topic}
          </span>
          
          {hasMarkedAsRead && (
            <div className="absolute top-4 right-4">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
          
          <h3 className="text-2xl font-bold mb-3 text-white line-clamp-2">{displayTitle}</h3>
          <div className="text-xs text-blue-300 mb-3">{formatDate(timestamp)}</div>
          <div className="text-blue-100 text-sm line-clamp-6">{summaryText}</div>
          
          <div className="absolute bottom-2 right-2 text-xs text-blue-400">
            Click to flip
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute inset-0 p-6 rounded-xl bg-gray-900 transform backface-hidden transition-transform duration-700 rotate-y-180 ${
            isFlipped ? 'rotate-y-0' : ''
          } ${hasMarkedAsRead ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
        >
          <h3 className="text-xl font-bold mb-4 text-white">Sources</h3>
          
          {sourcesList.length > 0 ? (
            <ul className="space-y-3 text-sm text-blue-100">
              {sourcesList.map((src, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-0.5 text-blue-400">•</span>
                  <a 
                    href={src.startsWith('http') ? src : `https://${src}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-300 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blue-300">No sources available.</p>
          )}
          
          <div className="absolute bottom-2 right-2 text-xs text-blue-400">
            Click to flip back
          </div>
        </div>
        
        {/* Mark as read button - stays visible on both sides */}
        {isAuthenticated && summaryId && (
          <button
            onClick={handleMarkAsRead}
            disabled={hasMarkedAsRead}
            className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-colors ${
              hasMarkedAsRead 
                ? 'bg-green-800/70 text-green-200' 
                : 'hover:bg-gray-800/80 text-blue-300 bg-gray-800/40'
            }`}
            title={hasMarkedAsRead ? 'Already read' : 'Mark as read'}
          >
            <BookOpenIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Ripple effect */}
        {rippleEffect && (
          <span 
            className="absolute rounded-full bg-gray-400/30 animate-ripple"
            style={{
              top: ripplePosition.y,
              left: ripplePosition.x,
              transformOrigin: 'center',
            }}
          ></span>
        )}
      </div>
      
      {/* Points earned toast notification */}
      {showPointsEarned && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-lg text-xs"
        >
          +1 point!
        </motion.div>
      )}
    </motion.div>
  );
};

export default SummaryCard;
