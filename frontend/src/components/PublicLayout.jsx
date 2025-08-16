import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track scroll position for navbar transparency effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Determine if the current page is active for nav highlighting
  const isActive = (path) => {
    return location.pathname === path ? 'text-white font-semibold' : 'text-blue-200 hover:text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {/* Floating pill navbar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-4">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`rounded-full px-4 py-3 backdrop-blur-md flex items-center justify-between max-w-4xl w-full transition-all duration-300 ${
            scrollPosition > 50 
              ? 'bg-gray-800/90 shadow-lg' 
              : 'bg-gray-800/40'
          }`}
        >
          <Link to="/" className="font-bold text-2xl">
            newt
          </Link>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link to="/" className={`px-3 py-2 rounded-full text-sm ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/features" className={`px-3 py-2 rounded-full text-sm ${isActive('/features')}`}>
              Features
            </Link>
            <Link to="/about" className={`px-3 py-2 rounded-full text-sm ${isActive('/about')}`}>
              About
            </Link>
            <Link 
              to="/coming-soon" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors ml-2"
            >
              Join Now
            </Link>
          </div>
        </motion.nav>
      </header>
      
      {/* Add padding to account for fixed navbar */}
      <div className="pt-20">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default PublicLayout;
