import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const FollowersPage = () => {
  const { userId } = useParams();
  const { token } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId && token) {
      fetchFollowers();
      fetchUserInfo();
    }
  }, [userId, token]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/user/${userId}/followers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch followers');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/user/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-blue-100">Loading followers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
              <h2 className="text-red-100 text-lg font-semibold mb-2">Error Loading Followers</h2>
              <p className="text-red-200">{error}</p>
              <button 
                onClick={fetchFollowers}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link 
              to={`/profile/${userId}`}
              className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
            >
              ← Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-blue-100">
              {user ? `${user.email.split('@')[0]}'s Followers` : 'Followers'}
            </h1>
            <p className="text-blue-300 mt-2">
              {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
            </p>
          </motion.div>

          {/* Followers List */}
          {followers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900 rounded-lg shadow-sm p-8 border border-gray-700 text-center"
            >
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-xl font-semibold text-blue-100 mb-2">No Followers Yet</h2>
              <p className="text-blue-300">
                {user?.is_self 
                  ? "Share your profile to gain followers!" 
                  : "This user hasn't gained any followers yet."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followers.map((follower, index) => (
                <motion.div
                  key={follower.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <Link to={`/profile/${follower.user_id}`} className="block">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                        {follower.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-blue-100 truncate">
                          {follower.email.split('@')[0]}
                        </h3>
                        <p className="text-blue-400 text-sm truncate">{follower.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{follower.points}</div>
                        <div className="text-xs text-blue-300">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{follower.total_summaries_read}</div>
                        <div className="text-xs text-blue-300">Articles</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-blue-400 text-xs">
                        Joined {formatDate(follower.created_at)}
                      </p>
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

export default FollowersPage;
