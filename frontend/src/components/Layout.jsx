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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-blue-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <nav className="relative z-20 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent lowercase tracking-tight">
                newt
              </Link>
            </div>

            {/* Updated navigation for logged in users */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">                <div className="hidden md:flex items-center bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-2 border border-slate-700/50">
                  <Link to="/dashboard" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Dashboard
                  </Link>
                  <Link to="/today" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Today's Summaries
                  </Link>
                  <Link to="/discover" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Discover
                  </Link>
                  <Link to="/past-summaries" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Past Summaries
                  </Link>
                  <Link to="/profile" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Profile
                  </Link>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg"
                  >
                    <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center text-blue-900 text-xs font-bold">
                      {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block">{user?.points || 0} pts</span>
                  </button>
                  
                  {showUserMenu && (                    <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-xl border border-slate-700/50 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-slate-300 border-b border-slate-700/50">
                          {user?.email}
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-2 border border-slate-700/50 space-x-1">
                  <Link to="/" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Home
                  </Link>
                  <Link to="/today" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Today's Summaries
                  </Link>
                  <Link to="/past-summaries" className="text-sm font-medium text-slate-200 hover:text-blue-300 transition-colors px-3 py-1 rounded-full hover:bg-slate-700/50">
                    Past Summaries
                  </Link>
                </div>
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 ${isLandingPage ? "w-full" : "py-6"}`}
        onClick={() => setShowUserMenu(false)}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
