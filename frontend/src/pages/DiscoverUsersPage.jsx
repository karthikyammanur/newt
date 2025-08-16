import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const DiscoverUsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          // Handle empty or invalid user array
          console.warn("API returned invalid user data format:", data);
          setUsers([]);
          setError("No users found or invalid data format");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch users');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users by a combination of points and activity
  const sortedUsers = filteredUsers.sort((a, b) => {
    const scoreA = a.points + (a.total_summaries_read * 2) + (a.follower_count * 5);
    const scoreB = b.points + (b.total_summaries_read * 2) + (b.follower_count * 5);
    return scoreB - scoreA;
  });
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
          <div className="text-center relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-blue-100">Discovering users...</p>
          </div>
        </div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
          <div className="text-center relative z-10">
            <div className="bg-red-900/80 backdrop-blur-lg border border-red-700/50 rounded-lg p-6 max-w-md">
              <h2 className="text-red-100 text-lg font-semibold mb-2">Error Loading Users</h2>
              <p className="text-red-200">{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchUsers}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </motion.button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden py-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-blue-100 mb-4">
              <span className="text-5xl mr-3">🔍</span>
              Discover Readers
            </h1>
            <p className="text-blue-300 text-lg">
              Find and connect with fellow tech news enthusiasts
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search users by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-blue-100 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center space-x-6 bg-gray-900 px-6 py-3 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{sortedUsers.length}</div>
                <div className="text-sm text-blue-300">Total Users</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {sortedUsers.reduce((sum, user) => sum + user.total_summaries_read, 0)}
                </div>
                <div className="text-sm text-blue-300">Articles Read</div>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {sortedUsers.reduce((sum, user) => sum + user.points, 0)}
                </div>
                <div className="text-sm text-blue-300">Total Points</div>
              </div>
            </div>
          </motion.div>

          {/* Users Grid */}
          {sortedUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 rounded-lg shadow-sm p-8 border border-gray-700 text-center"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-blue-100 mb-2">No Users Found</h2>
              <p className="text-blue-300">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users to discover right now.'}
              </p>
              <button 
                onClick={fetchUsers}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Users
              </button>
              {/* Fallback User Card - Always show this if no users are found */}
              <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md mx-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">
                    T
                  </div>
                  <h3 className="text-lg font-semibold text-blue-100 mb-1">
                    TestUser
                  </h3>
                  <p className="text-blue-400 text-sm mb-4">testuser@example.com</p>
                  <div className="grid grid-cols-2 gap-4 w-full mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">42</div>
                      <div className="text-xs text-blue-300">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">15</div>
                      <div className="text-xs text-blue-300">Articles</div>
                    </div>
                  </div>
                  <p className="text-blue-400 text-xs mt-2">Example User Card</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedUsers.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index % 12) * 0.05 }}
                  className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 hover:bg-gray-800 transition-all hover:scale-105"
                >
                  <Link to={`/profile/${user.user_id}`} className="block">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      
                      {/* User Info */}
                      <h3 className="text-lg font-semibold text-blue-100 mb-1 truncate w-full">
                        {user.email.split('@')[0]}
                      </h3>
                      <p className="text-blue-400 text-sm mb-4 truncate w-full">{user.email}</p>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 w-full mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{user.points}</div>
                          <div className="text-xs text-blue-300">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">{user.total_summaries_read}</div>
                          <div className="text-xs text-blue-300">Articles</div>
                        </div>
                      </div>
                      
                      {/* Social Stats */}
                      <div className="flex justify-center space-x-4 w-full mb-3">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-orange-400">{user.follower_count}</div>
                          <div className="text-xs text-blue-300">Followers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-400">{user.following_count}</div>
                          <div className="text-xs text-blue-300">Following</div>
                        </div>
                      </div>
                      
                      {/* Join Date */}
                      <p className="text-blue-400 text-xs">
                        Joined {formatDate(user.created_at)}
                      </p>
                      
                      {/* Badge for top users */}
                      {index < 3 && (
                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          index === 0 ? 'bg-yellow-600 text-yellow-100' :
                          index === 1 ? 'bg-gray-600 text-gray-100' : 
                          'bg-orange-600 text-orange-100'
                        }`}>
                          {index === 0 ? '🥇 Top Reader' : 
                           index === 1 ? '🥈 Active Reader' : 
                           '🥉 Rising Star'}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DiscoverUsersPage;
