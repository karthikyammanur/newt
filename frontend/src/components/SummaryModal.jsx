import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SummaryModal = ({ 
  isOpen, 
  onClose, 
  topic, 
  title, 
  summary, 
  timestamp, 
  sources = [] 
}) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose} // Click outside to close
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              duration: 0.4, 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Header */}
              <div className="p-8 pb-6">
                {/* Topic badge */}
                <div className="relative inline-block mb-6">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full uppercase tracking-wider shadow-lg">
                    {topic}
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {displayTitle}
                </h2>

                {/* Timestamp */}
                <div className="flex items-center text-slate-300 mb-6">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatDate(timestamp)}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8">
                {/* Summary */}
                <div className="mb-8">
                  <div className="prose prose-slate prose-invert max-w-none">
                    <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                      {summaryText}
                    </div>
                  </div>
                </div>

                {/* Sources */}
                {sourcesList.length > 0 && (
                  <div className="border-t border-slate-700/50 pt-8">
                    <div className="flex items-center mb-6">
                      <svg className="w-6 h-6 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-xl font-bold text-white">Sources</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {sourcesList.map((src, i) => (
                        <div key={i} className="group">
                          <div className="flex items-start p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-3 mr-4 group-hover:bg-purple-300"></div>
                            <a 
                              href={src.startsWith('http') ? src : `https://${src}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-slate-200 hover:text-purple-300 transition-colors duration-200 text-base leading-relaxed flex-1 group-hover:underline break-all"
                            >
                              {src}
                            </a>
                            <svg className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors duration-200 flex-shrink-0 ml-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SummaryModal;
