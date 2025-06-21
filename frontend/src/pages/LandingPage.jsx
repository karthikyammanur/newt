import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const topics = [
  { id: 1, title: 'machine learning' },
  { id: 2, title: 'semiconductors' },
  { id: 3, title: 'startups' },
  { id: 4, title: 'programming languages' },
  { id: 5, title: 'web development' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

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

  const handleScroll = (direction) => {
    const container = document.getElementById('topics-container');
    const scrollAmount = direction === 'left' ? -300 : 300;
    if (container) {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  const backgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
      rgba(59, 130, 246, 0.2), 
      rgba(147, 51, 234, 0.2))`,
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className="absolute inset-0 transition-all duration-300"
        style={backgroundStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-gray-900 mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          NEWT
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl text-gray-600 mb-8 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          summarizing the world of tech, one byte at a time.
        </motion.p>
        
        <motion.button
          onClick={() => navigate('/summaries')}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold 
                    hover:bg-blue-700 transition-colors mb-16 shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Reading
        </motion.button>

        <div className="w-full max-w-6xl relative">
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20
                      bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20
                      bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div
            id="topics-container"
            className="overflow-x-auto hide-scrollbar flex gap-4 px-12"
          >
            {topics.map((topic) => (
              <motion.div
                key={topic.id}
                className="flex-shrink-0 bg-white p-6 rounded-xl shadow-lg 
                          hover:shadow-xl transition-shadow cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {topic.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
