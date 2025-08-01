import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SummaryModal from './SummaryModal';

const SimpleSummaryCard = ({ 
  topic, 
  summary, 
  timestamp, 
  title = '', 
  sources = [], 
  summaryId = null 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEnlargeSummary = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
        className={`relative w-full h-full select-none cursor-pointer rounded-xl shadow-lg overflow-hidden transition-all duration-700 ${
          isFlipped ? 'shadow-xl' : 'hover:shadow-xl'
        }`} 
        onClick={handleFlip}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 p-6 rounded-xl bg-gray-900 transform transition-transform duration-700 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          <span className="inline-block px-3 py-1 bg-blue-800 text-blue-200 text-xs font-semibold rounded-full mb-2 uppercase tracking-wide">
            {topic}
          </span>
            <h3 className="text-2xl font-bold mb-3 text-white line-clamp-2">{displayTitle}</h3>
          <div className="text-xs text-blue-300 mb-3">{formatDate(timestamp)}</div>
          <div 
            className="text-blue-100 text-sm line-clamp-6 cursor-pointer hover:bg-slate-800/30 rounded-lg p-2 -m-2 transition-colors group"
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
          </div>
          
          <div className="absolute bottom-2 right-2 text-xs text-blue-400">
            Click to flip
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute inset-0 p-6 rounded-xl bg-gray-900 transform transition-transform duration-700 rotate-y-180 ${
            isFlipped ? 'rotate-y-0' : ''
          }`}
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
      </div>      {/* Summary Modal */}
      <SummaryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        topic={topic}
        title={title}
        summary={summary}
        timestamp={timestamp}
        sources={sources}
      />
    </motion.div>
  );
};

export default SimpleSummaryCard;
