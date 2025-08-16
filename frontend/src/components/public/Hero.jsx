import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4">
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-6 text-white"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          Catch up <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">in a click.</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          AI-curated tech summaries delivered daily to keep you informed without the overwhelm.
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link 
            to="/coming-soon" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </Link>
          <button 
            onClick={scrollToFeatures}
            className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 rounded-full text-white font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            See features
          </button>
        </motion.div>
      </div>
      
      {/* Scroll down indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
};

export default Hero;
