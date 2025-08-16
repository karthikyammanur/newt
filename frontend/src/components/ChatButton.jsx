import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';

const ChatButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      {/* Floating Chat Button with enhanced mobile responsiveness */}
      <motion.button
        onClick={toggleModal}
        className={`
          fixed z-50
          ${isMobile ? 'bottom-4 right-4 w-14 h-14' : 'bottom-6 right-6 w-16 h-16'}
          bg-gradient-to-r from-blue-600 to-indigo-700 
          hover:from-blue-500 hover:to-indigo-600
          text-white rounded-full 
          shadow-lg hover:shadow-xl hover:shadow-blue-500/25
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-500/50
          group flex items-center justify-center
          ${isModalOpen ? 'rotate-45' : 'rotate-0'}
        `}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          rotate: isModalOpen ? 45 : 0,
          scale: isModalOpen ? 1.05 : 1
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut" 
        }}
        aria-label={isModalOpen ? "Close chat" : "Open chat"}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Chat Icon */}
          <motion.svg
            className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ 
              opacity: isModalOpen ? 0 : 1,
              rotate: isModalOpen ? 90 : 0,
              scale: isModalOpen ? 0.8 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </motion.svg>
          
          {/* Close Icon */}
          <motion.svg
            className={`absolute ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ 
              opacity: isModalOpen ? 1 : 0,
              rotate: isModalOpen ? 0 : -90,
              scale: isModalOpen ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </motion.svg>
        </div>
        
        {/* Enhanced glowing ring effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-blue-600"
          animate={{ 
            opacity: isModalOpen ? 0.4 : 0.2,
            scale: isModalOpen ? 1.2 : 1
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeInOut"
          }}
          style={{
            filter: "blur(8px)",
            zIndex: -1
          }}
        />
        
        {/* Pulse animation when not open */}
        <AnimatePresence>
          {!isModalOpen && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-400"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.6, 0, 0.6]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ zIndex: -2 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Enhanced Chat Modal with better mobile support */}
      <ChatModal 
        isOpen={isModalOpen} 
        onClose={toggleModal}
        isMobile={isMobile}
      />
    </>
  );
};

export default ChatButton;
