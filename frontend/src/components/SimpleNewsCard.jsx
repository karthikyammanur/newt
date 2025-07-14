import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SimpleNewsCard = ({ topic, summary, title }) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  return (
    <>
      {/* Enlarged Modal */}
      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsEnlarged(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white text-black p-8 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button
                  onClick={() => setIsEnlarged(false)}
                  className="text-gray-600 hover:text-black"
                >
                  ✕
                </button>
              </div>
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {topic}
                </span>
              </div>
              <div className="text-gray-700 leading-relaxed">
                {summary}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Card */}
      <div
        className="bg-gradient-to-br from-slate-800 to-blue-900 text-white p-6 rounded-lg cursor-pointer hover:shadow-xl transition-all"
        onClick={() => setIsEnlarged(true)}
      >
        <div className="mb-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {topic}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-200 text-sm line-clamp-4">
          {summary.substring(0, 200)}...
        </p>
        <div className="mt-4 text-blue-300 text-xs">
          Click to expand and read full summary
        </div>
      </div>
    </>
  );
};

export default SimpleNewsCard;
