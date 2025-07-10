import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { userId } = useParams();
  const { token, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (userId && token) {
      fetchProfile();
    }
  }, [userId, token]);  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/user/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch profile');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile || profile.is_self || followLoading) return;

    try {
      setFollowLoading(true);
      const endpoint = profile.is_following ? 'unfollow' : 'follow';
      const response = await fetch(`http://localhost:8000/api/${endpoint}/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh profile to get updated follow status
        await fetchProfile();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || `Failed to ${endpoint} user`);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-blue-100">Loading profile...</p>
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
              <h2 className="text-red-100 text-lg font-semibold mb-2">Error Loading Profile</h2>
              <p className="text-red-200">{error}</p>
              <button 
                onClick={fetchProfile}
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

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-blue-100">Profile not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900 rounded-lg shadow-sm p-8 border border-gray-700 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {profile.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h1 className="text-3xl font-bold text-blue-100">
                    {profile.email.split('@')[0]}
                  </h1>
                  <p className="text-blue-300 text-lg">{profile.email}</p>
                  <p className="text-blue-400 text-sm mt-1">
                    Member since {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              {!profile.is_self && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    profile.is_following
                      ? 'bg-gray-700 text-blue-100 hover:bg-gray-600 border border-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {followLoading ? 'Loading...' : profile.is_following ? 'Unfollow' : 'Follow'}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-blue-400">{profile.points}</div>
              <div className="text-sm text-blue-300 mt-1">Total Points</div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-green-400">{profile.total_summaries_read}</div>
              <div className="text-sm text-blue-300 mt-1">Articles Read</div>
            </div>

            <Link 
              to={`/profile/${userId}/followers`}
              className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 text-center hover:bg-gray-800 transition-colors"
            >
              <div className="text-3xl font-bold text-purple-400">{profile.follower_count}</div>
              <div className="text-sm text-blue-300 mt-1">Followers</div>
            </Link>

            <Link 
              to={`/profile/${userId}/following`}
              className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 text-center hover:bg-gray-800 transition-colors"
            >
              <div className="text-3xl font-bold text-orange-400">{profile.following_count}</div>
              <div className="text-sm text-blue-300 mt-1">Following</div>
            </Link>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Topics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏷️</span>
                Top Reading Topics
              </h2>
              
              {profile.top_topics && profile.top_topics.length > 0 ? (
                <div className="space-y-3">
                  {profile.top_topics.slice(0, 3).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index === 0 ? 'bg-yellow-600' : 
                          index === 1 ? 'bg-gray-600' : 'bg-orange-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-3 text-blue-100 capitalize">{topic.topic}</span>
                      </div>
                      <div className="text-blue-300 text-sm">
                        {topic.count} reads
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-blue-300 text-center py-8">
                  <p>No reading topics yet</p>
                  <p className="text-sm text-blue-400 mt-1">Start reading to see favorite topics!</p>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Recent Activity
              </h2>
              
              {profile.recent_activity && profile.recent_activity.length > 0 ? (
                <div className="space-y-3">
                  {profile.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">📚</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-blue-100 text-sm">{activity.title || 'Article Read'}</p>
                          <p className="text-blue-400 text-xs">{activity.topic}</p>
                        </div>
                      </div>
                      <div className="text-blue-300 text-xs">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-blue-300 text-center py-8">
                  <p>No recent activity</p>
                  <p className="text-sm text-blue-400 mt-1">Activity will appear here when reading articles</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Reading Streak & Achievement Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Achievements & Milestones
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🔥</div>
                <div className="text-lg font-bold text-orange-400">
                  {profile.reading_streak?.current || 0} days
                </div>
                <div className="text-sm text-blue-300">Current Streak</div>
              </div>

              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-lg font-bold text-green-400">
                  {profile.reading_streak?.longest || 0} days
                </div>
                <div className="text-sm text-blue-300">Longest Streak</div>
              </div>

              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-lg font-bold text-blue-400">
                  {profile.avg_daily_reads || 0}
                </div>
                <div className="text-sm text-blue-300">Avg Daily Reads</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
