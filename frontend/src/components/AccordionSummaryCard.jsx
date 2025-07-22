import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AccordionSummaryCard = ({ summaries = [] }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [readStatuses, setReadStatuses] = useState({}); // Track read status for each card
  const [showPointsEarned, setShowPointsEarned] = useState({}); // Show points feedback per card
  const [showStreakUpdate, setShowStreakUpdate] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { markSummaryRead, isAuthenticated } = useAuth();
  const toggleCard = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleMarkAsRead = async (e, summaryId, index) => {
    e.stopPropagation();
    if (!isAuthenticated || !summaryId || readStatuses[index]) return;

    const result = await markSummaryRead(summaryId);
    if (result.success) {
      setReadStatuses(prev => ({ ...prev, [index]: true }));
      
      if (result.streak && result.streak.updated) {
        setStreakInfo(result.streak);
        setShowStreakUpdate(true);
        setTimeout(() => setShowStreakUpdate(false), 4000);
      }
      
      if (result.pointsEarned > 0) {
        setShowPointsEarned(prev => ({ ...prev, [index]: true }));
        setTimeout(() => setShowPointsEarned(prev => ({ ...prev, [index]: false })), 3000);
      } else if (result.alreadyRead) {
        setErrorMessage('Already read - no points awarded');
        setTimeout(() => setErrorMessage(''), 2500);
      }
    } else {
      setErrorMessage(result.error || 'Failed to mark as read');
      setTimeout(() => setErrorMessage(''), 2500);
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

  const extractSources = (sources, summary) => {
    // Handle sources being a string instead of array
    let sourcesList = sources;
    if (typeof sources === 'string') {
      sourcesList = sources ? [sources] : [];
    } else if (!Array.isArray(sources)) {
      sourcesList = [];
    }

    // Extract sources from summary if not provided
    if (!sourcesList.length && summary && summary.includes('Sources:')) {
      const parts = summary.split('Sources:');
      sourcesList = parts[1]
        ? parts[1].split(',').map(s => s.trim()).filter(Boolean)
        : [];
    }

    return sourcesList;
  };

  const getSummaryText = (summary) => {
    // Remove sources from summary text
    if (summary && summary.includes('Sources:')) {
      return summary.split('Sources:')[0].trim();
    }
    return summary;
  };

  const getSourceName = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (!summaries || summaries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center px-4 py-12"
      >
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 max-w-md">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold text-slate-300 mb-3">
            No summaries available for today
          </h2>
          <p className="text-slate-400">
            Check back later for fresh tech news summaries.
          </p>
        </div>      </motion.div>
    );
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4 max-w-4xl mx-auto"
      >
        {summaries.map((summary, index) => {
          const isExpanded = expandedCard === index;
          const sourcesList = extractSources(summary.sources, summary.summary);
          const summaryText = getSummaryText(summary.summary);
          const displayTitle = summary.title && summary.title.trim() ? summary.title.trim() : summary.topic;

          return (
            <motion.div
              key={`${summary.date}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm"
            >{/* Card Header - Always visible */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer hover:bg-slate-700/20 rounded-lg p-2 -m-2 transition-all duration-300"
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {/* Topic Badge */}
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                      {summary.topic}
                    </span>
                    {/* Sources counter */}
                    {sourcesList.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        {sourcesList.length}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {displayTitle}
                  </h3>
                  <div className="flex items-center text-sm text-slate-400">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(summary.date)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3 ml-4">                {/* Mark as Read Button */}
                  {isAuthenticated && summary._id && (
                    <motion.button
                      onClick={(e) => handleMarkAsRead(e, summary._id, index)}
                      disabled={readStatuses[index]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-2 rounded-full transition-colors ${
                        readStatuses[index]
                          ? 'bg-green-700/50 text-green-300' 
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-blue-300'
                      }`}
                      title={readStatuses[index] ? 'Already read (+1 point earned)' : 'Mark as read to earn 1 point'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.button>
                  )}

                  {/* Expand/Collapse Icon */}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 cursor-pointer p-2 hover:bg-slate-700/30 rounded-lg transition-colors"
                    onClick={() => toggleCard(index)}
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-slate-700/50">
                    {/* Summary Content */}
                    <div className="pt-6 mb-6">
                      <div className="prose prose-slate prose-invert max-w-none">
                        <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                          {summaryText}
                        </p>
                      </div>
                    </div>

                    {/* Sources Section */}
                    {sourcesList.length > 0 && (
                      <div className="border-t border-slate-700/50 pt-6">
                        <div className="flex items-center mb-4">
                          <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          <h4 className="text-lg font-semibold text-white">Sources</h4>
                        </div>
                        <ul className="space-y-3">
                          {sourcesList.map((source, sourceIndex) => (
                            <motion.li
                              key={sourceIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: sourceIndex * 0.1 }}
                              className="flex items-start group"
                            >
                              <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2.5 mr-3 group-hover:bg-purple-300 transition-colors"></div>
                              <a
                                href={source.startsWith('http') ? source : `https://${source}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-300 hover:text-purple-300 transition-colors duration-200 text-sm leading-relaxed flex-1 group-hover:underline break-all"
                              >
                                {getSourceName(source)}
                              </a>
                              <svg className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors duration-200 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>

    {/* Toast notifications - positioned like Past Summaries */}
    <AnimatePresence>
      {Object.keys(showPointsEarned).some(key => showPointsEarned[key]) && (
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
    </AnimatePresence>

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
      )}    </AnimatePresence>
    </>
  );
};

export default AccordionSummaryCard;
