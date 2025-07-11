import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, isLandingPage = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-blue-100">
      <nav className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl md:text-3xl font-bold text-blue-100 lowercase tracking-tight">
                newt
              </Link>
            </div>            <div className="flex items-center space-x-6">
              <Link to="/" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Home
              </Link>
              <Link to="/today" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Today's Summaries
              </Link>
              <Link to="/past-summaries" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                Past Summaries
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/discover" className="text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors">
                    Discover
                  </Link>
                </>
              )}
              
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm font-medium text-blue-100 hover:text-blue-300 transition-colors bg-gray-800 px-3 py-2 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block">{user?.points || 0} pts</span>
                  </button>
                    {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-900">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-gray-500">
                          {user?.points || 0} points • {user?.total_summaries_read || 0} articles read
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Today: {user?.today_reads || 0} articles
                        </p>
                      </div>                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={isLandingPage ? "w-full" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"}
        onClick={() => setShowUserMenu(false)}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
