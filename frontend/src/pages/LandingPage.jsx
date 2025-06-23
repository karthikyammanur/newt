import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';

const topics = [
  { id: 1, title: 'machine learning' },
  { id: 2, title: 'semiconductors' },
  { id: 3, title: 'startups' },
  { id: 4, title: 'programming languages' },
  { id: 5, title: 'web development' },
  { id: 6, title: 'artificial intelligence' },
  { id: 7, title: 'software engineering' },
  { id: 8, title: 'cloud computing' },
  { id: 9, title: 'cybersecurity' },
  { id: 10, title: 'data science' }
];

// Number of cards visible at once (this will vary based on screen size via CSS)
const VISIBLE_TOPICS = 3;

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollTimer = useRef(null);

  // Track mouse position for background effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  // Continuous auto-scroll carousel with smooth animation
  useEffect(() => {
    if (!isPaused) {
      // Use a shorter interval for more continuous motion
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => 
          // Loop back to the beginning when we reach the end
          (prevIndex + 0.05) % topics.length
        );
      }, 50); // Update more frequently for smoother motion
      
      autoScrollTimer.current = timer;
      
      return () => clearInterval(timer);
    }
  }, [isPaused]);
  // Manual navigation with temporary pause
  const goToSlide = (index) => {
    // Temporarily pause to handle the manual navigation
    setIsPaused(true);
    // Set to exact index (not fractional) for indicators to work correctly
    setCurrentIndex(index);
    
    // Resume very quickly for continuous effect
    setTimeout(() => {
      setIsPaused(false);
    }, 800);
  };

  // Handle next/prev navigation
  const handleNavigation = (direction) => {
    // Temporarily pause
    setIsPaused(true);
    
    // Get current index rounded to nearest integer
    const roundedIndex = Math.round(currentIndex);
    
    const newIndex = direction === 'next'
      ? (roundedIndex + 1) % topics.length
      : (roundedIndex - 1 + topics.length) % topics.length;
    
    // Set to exact index (not fractional)
    setCurrentIndex(newIndex);
    
    // Resume very quickly for continuous effect
    setTimeout(() => {
      setIsPaused(false);
    }, 800);
  };

  const backgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, #232946 0%, #121212 100%)`
  };

  return (
    <Layout isLandingPage={true}>
      <div className="relative overflow-hidden dark min-h-screen w-full">
        {/* Background gradient that follows cursor */}
        <motion.div
          className="absolute inset-0 w-full h-full transition-all duration-300"
          style={backgroundStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Content container */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center">
          {/* Title and subtitle */}
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-4 text-white lowercase drop-shadow-lg text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            newt
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 text-center text-blue-200"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            summarizing the world of tech, one byte at a time.
          </motion.p>
          
          {/* Start Reading Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <Link 
              to="/summaries" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
                        transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Reading
            </Link>
          </motion.div>
          
          {/* Topic carousel - transform-based implementation */}
          <div className="w-full max-w-5xl relative px-6 mb-8">            {/* Previous button - moved further left */}
            <button 
              onClick={() => handleNavigation('prev')}
              className="absolute top-1/2 left-[-20px] z-20 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 
                        text-white rounded-full p-3 shadow-lg backdrop-blur-sm"
              aria-label="Previous topic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Carousel viewport */}
            <div className="overflow-hidden">              <div 
                className="flex transition-transform duration-[1500ms] ease-linear"
                style={{ transform: `translateX(-${currentIndex * (100 / VISIBLE_TOPICS)}%)` }}
              >
                {/* Topic cards */}
                {topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    onClick={() => navigate('/summaries?topic=' + encodeURIComponent(topic.title))}
                    className="topic-card flex-shrink-0 cursor-pointer p-6 rounded-xl shadow-lg
                              transition-all bg-gray-800/50 text-blue-100 backdrop-blur-sm text-center
                              select-none hover:bg-gray-700 mx-3"
                    style={{ flex: `0 0 calc(${100 / VISIBLE_TOPICS}% - 24px)` }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="text-lg font-semibold lowercase">
                      {topic.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>
              {/* Next button - moved further right */}
            <button 
              onClick={() => handleNavigation('next')}
              className="absolute top-1/2 right-[-20px] z-20 transform -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700 
                        text-white rounded-full p-3 shadow-lg backdrop-blur-sm"
              aria-label="Next topic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
            {/* Topic indicators */}
          <div className="flex justify-center space-x-3 mt-4">
            {topics.map((_, index) => (
              <button
                key={index}
                className={`h-3 rounded-full transition-all ${
                  Math.floor(currentIndex) === index ? 'w-6 bg-blue-400' : 'w-3 bg-gray-600/50'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to topic ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
