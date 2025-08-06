import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ChatModal = ({ isOpen, onClose, isMobile = false }) => {  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Newt AI, powered by Gemini. I can help you understand your reading habits, discover trending topics, or answer questions about the app. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      // Handle Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && inputMessage.trim() && !isLoading) {
        sendMessage();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, inputMessage, isLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/ai-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          input: userMessage.text
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.output || data.message || 'I apologize, but I couldn\'t generate a response. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);      const errorMessage = {
        id: Date.now() + 1,
        text: 'I apologize, but I\'m having trouble connecting to Gemini right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose} // Click outside to close
        >
          {/* Black translucent background */}
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
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
            }}            className={`
              relative w-full bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 
              rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col
              ${isMobile 
                ? 'max-w-full h-[95vh] mx-2 rounded-lg' 
                : 'max-w-2xl h-[700px]'
              }
            `}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-modal-title"
            aria-describedby="chat-modal-description"
            tabIndex={-1}
          >{/* Close button */}
            <motion.button
              onClick={onClose}
              className={`
                absolute top-4 right-4 z-10 p-2 rounded-full 
                bg-slate-700/50 hover:bg-slate-600/50 transition-colors 
                text-slate-300 hover:text-white
                ${isMobile ? 'p-3' : 'p-2'}
              `}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close chat"
            >
              <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Header */}
            <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center space-x-4 ${isMobile ? 'p-4' : 'p-6'}`}>
              <motion.div 
                className={`bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold ${isMobile ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                N
              </motion.div>              <div>
                <h3 id="chat-modal-title" className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>Newt AI</h3>
                <p id="chat-modal-description" className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>Powered by Gemini • Your Reading Assistant</p>
              </div>
            </div>            {/* Scrollable Messages Container */}
            <div className={`flex-1 overflow-y-auto space-y-4 bg-slate-900/50 custom-scrollbar ${isMobile ? 'p-4' : 'p-6'}`}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    className={`${isMobile ? 'max-w-[85%]' : 'max-w-[75%]'} px-5 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : message.isError
                        ? 'bg-red-800/80 text-red-200 border border-red-600/50'
                        : 'bg-slate-700/80 text-slate-200 border border-slate-600/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className={`leading-relaxed whitespace-pre-wrap ${isMobile ? 'text-xs' : 'text-sm'}`}>{message.text}</p>
                    <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-xs'} ${
                      message.sender === 'user' 
                        ? 'text-blue-100' 
                        : 'text-slate-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
                {/* Enhanced Loading indicator for Gemini */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-700/80 border border-slate-600/50 px-5 py-3 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-slate-300">Gemini is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`bg-red-900/50 border-t border-red-700/50 ${isMobile ? 'px-4 py-2' : 'px-6 py-3'}`}
              >
                <p className={`text-red-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>{error}</p>
              </motion.div>
            )}{/* Input Section */}
            <div className={`border-t border-slate-700/50 bg-slate-800/50 ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                <motion.input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isMobile ? "Ask me anything..." : "Ask me about your reading habits, news topics, or anything else..."}
                  className={`
                    flex-1 border border-slate-600 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    bg-slate-700/50 text-slate-100 placeholder-slate-400 
                    transition-all duration-200
                    ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3 text-sm'}
                  `}
                  disabled={isLoading}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`
                    bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 
                    disabled:cursor-not-allowed text-white rounded-xl 
                    transition-all duration-200 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 
                    shadow-lg hover:shadow-xl
                    ${isMobile ? 'px-4 py-2' : 'px-6 py-3'}
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isLoading ? { rotate: [0, 360] } : {}}
                  transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
                >
                  <svg className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
