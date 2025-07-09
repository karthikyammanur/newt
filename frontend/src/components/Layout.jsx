import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Layout = ({ children, isLandingPage = false }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-blue-100">
      <nav className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl md:text-3xl font-bold text-blue-100 lowercase tracking-tight">
                newt
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Home
              </Link>
              <Link to="/summaries" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Today's Summaries
              </Link>
              <Link to="/past-summaries" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Past Summaries
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={isLandingPage ? "w-full" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
