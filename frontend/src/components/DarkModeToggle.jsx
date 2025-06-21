import React from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useDarkMode();

  return (
    <motion.button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`fixed top-4 right-4 p-2 rounded-full z-50 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                  shadow-lg hover:shadow-xl transition-shadow`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <SunIcon className="h-6 w-6 text-yellow-400" />
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-600" />
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
