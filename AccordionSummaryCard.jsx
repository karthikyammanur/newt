import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ShareIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const AccordionSummaryCard = ({ summary, index, isExpanded, onToggle, onMarkAsRead, onShare, onShowReel }) => {
  const { topic, summary: summaryText, _id: summaryId, sources, isRead } = summary;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut"
      },
    }),
  };

  const contentVariants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
    expanded: { 
      height: 'auto', 
      opacity: 1, 
      marginTop: '1rem',
      transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="bg-off-white text-matte-black rounded-2xl shadow-md overflow-hidden"
    >
      {/* Header - Always visible and clickable */}
      <div
        className="p-6 cursor-pointer flex justify-between items-center"
        onClick={() => onToggle(index)}
      >
        <h3 className="text-xl font-bold font-heading">{topic}</h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-6 h-6 text-accent-gray" />
        </motion.div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={contentVariants}
            className="px-6 overflow-hidden"
          >
            <p className="font-body text-gray-800 leading-relaxed pb-6 border-b border-accent-gray/20">
              {summaryText}
            </p>
            
            {/* Action Buttons */}
            <div className="py-4 flex items-center justify-end space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); onShowReel(summary); }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-matte-black bg-transparent hover:bg-accent-gray/10 transition-colors duration-200"
              >
                <BookOpenIcon className="w-5 h-5" />
                <span>View Reel</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare(summary); }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-matte-black bg-transparent hover:bg-accent-gray/10 transition-colors duration-200"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMarkAsRead(summaryId, index); }}
                disabled={isRead}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  isRead
                    ? 'text-matte-black/60 cursor-not-allowed'
                    : 'text-matte-black bg-transparent hover:bg-accent-gray/10'
                }`}
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>{isRead ? 'Read' : 'Mark as Read'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccordionSummaryCard;