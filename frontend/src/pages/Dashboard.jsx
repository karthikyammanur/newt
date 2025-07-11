import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);

const Dashboard = () => {
  const { isAuthenticated, token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated, token]);  const fetchDashboardData = async () => {
    if (!isAuthenticated || !token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get dashboard data
      const dashboardResponse = await fetch('http://localhost:8000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Get user info for name
      const userResponse = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (dashboardResponse.ok && userResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        const userData = await userResponse.json();
        
        // Extract username from email (before @)
        const username = userData.email ? userData.email.split('@')[0] : 'Reader';
        
        // Combine dashboard data with user info
        setAnalytics({
          ...dashboardData.analytics,
          user_name: username,
          user_id: userData.user_id
        });
        
        setError(null);
      } else {
        // Handle error from either request
        let errorMessage = 'Failed to fetch dashboard data';
        if (!dashboardResponse.ok) {
          const errorData = await dashboardResponse.json();
          errorMessage = errorData.detail || errorMessage;
        } else if (!userResponse.ok) {
          const errorData = await userResponse.json();
          errorMessage = errorData.detail || errorMessage;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  // Chart color schemes - matching app theme
  const colors = {
    primary: '#3B82F6',     // blue-500
    secondary: '#10B981',   // emerald-500  
    accent: '#F59E0B',      // amber-500
    danger: '#EF4444',      // red-500
    purple: '#8B5CF6',      // violet-500
    pink: '#EC4899',        // pink-500
    teal: '#14B8A6',        // teal-500
    orange: '#F97316',      // orange-500
    background: '#111827',  // gray-900
    cardBg: '#1F2937',      // gray-800
    text: '#DBEAFE',        // blue-100
  };

  const topicColors = [colors.primary, colors.secondary, colors.accent, colors.danger, colors.purple];

  // Generate Daily Activity Chart Data
  const getDailyActivityChartData = () => {
    if (!analytics?.recent_activity) return null;

    return {
      labels: analytics.recent_activity.map(day => {
        const date = new Date(day.date);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Daily Reads',
          data: analytics.recent_activity.map(day => day.reads),
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  // Generate Top Topics Pie Chart Data
  const getTopicsChartData = () => {
    if (!analytics?.top_topics) return null;

    return {
      labels: analytics.top_topics.map(topic => topic.topic.charAt(0).toUpperCase() + topic.topic.slice(1)),
      datasets: [
        {
          data: analytics.top_topics.map(topic => topic.count),
          backgroundColor: analytics.top_topics.map((_, index) => topicColors[index % topicColors.length]),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  // Generate Reading Streak Line Chart Data (showing progression over time)
  const getStreakChartData = () => {
    if (!analytics?.daily_read_log) return null;

    // Create streak progression data from daily read log
    const sortedDates = Object.keys(analytics.daily_read_log).sort();
    const streakData = [];
    let currentStreak = 0;

    sortedDates.forEach(date => {
      if (analytics.daily_read_log[date] > 0) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      streakData.push({ date, streak: currentStreak });
    });

    return {
      labels: streakData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Reading Streak (Days)',
          data: streakData.map(item => item.streak),
          borderColor: colors.secondary,
          backgroundColor: colors.secondary + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.secondary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
        },
      ],
    };
  };

  // Generate Reading Activity by Hour Chart (mock data based on most_active_time)
  const getHourlyActivityChartData = () => {
    if (!analytics?.most_active_time) return null;

    // Generate mock hourly data based on the user's most active time
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const activeHour = analytics.most_active_time.hour;
    
    // Create a distribution around the most active hour
    const data = hours.map(hour => {
      const distance = Math.abs(hour - activeHour);
      const maxDistance = 12;
      const intensity = Math.max(0, 100 - (distance * 10));
      return Math.floor(intensity * (analytics.total_summaries_read / 100));
    });

    return {
      labels: hours.map(hour => {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}${period}`;
      }),
      datasets: [
        {
          label: 'Reading Activity',
          data: data,
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          borderWidth: 1,
          borderRadius: 2,
        },
      ],
    };
  };
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colors.text,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.text,
        },
        grid: {
          color: '#374151', // gray-700
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: colors.text,
        },
        grid: {
          color: '#374151', // gray-700
        },
      },
    },
  };
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: colors.text,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = analytics.top_topics[context.dataIndex].percentage;
            return `${context.label}: ${context.parsed} reads (${percentage}%)`;
          }
        }
      }
    },
  };
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-blue-100">Loading dashboard...</p>
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
              <h2 className="text-red-100 text-lg font-semibold mb-2">Error Loading Dashboard</h2>
              <p className="text-red-200">{error}</p>
              <button 
                onClick={fetchDashboardData}
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
  if (!analytics) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-blue-100">No analytics data available</p>
          </div>
        </div>
      </Layout>
    );
  }  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          {/* Welcome Header */}
          <div className="mb-8 animate-slide-in">
            <h1 className="text-3xl font-bold text-blue-100">👋 Welcome, {analytics.user_name || 'Reader'}!</h1>
            <p className="text-blue-300 mt-2">Track your reading progress and discover your habits</p>
          </div>
            {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <a 
              href="/today" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-fade-in animation-delay-300"
            >
              <span className="mr-2">📰</span>
              Read Today's Summaries
            </a>
            {analytics.reading_streak?.current > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-gray-800 text-blue-100 rounded-lg border border-gray-700 animate-fade-in animation-delay-600">
                <span className="text-xl mr-2">🔥</span>
                <span>Day {analytics.reading_streak.current} streak!</span>
              </div>
            )}
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-800">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-300">Total Reads</p>
                  <p className="text-2xl font-bold text-blue-100">{analytics.total_summaries_read}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-800">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-300">Total Points</p>
                  <p className="text-2xl font-bold text-blue-100">{analytics.total_points}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-800">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-300">Current Streak</p>
                  <p className="text-2xl font-bold text-blue-100">{analytics.reading_streak.current}</p>
                  <p className="text-xs text-blue-400">days</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-800">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-300">Daily Average</p>
                  <p className="text-2xl font-bold text-blue-100">{analytics.avg_daily_reads}</p>
                  <p className="text-xs text-blue-400">reads/day</p>
                </div>
              </div>
            </div>
          </div>          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Activity Bar Chart */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-blue-100 mb-4">📅 Daily Reading Activity (Last 7 Days)</h2>
              <div className="h-64">
                {getDailyActivityChartData() && (
                  <Bar data={getDailyActivityChartData()} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Top Topics Pie Chart */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-blue-100 mb-4">🏷️ Top Reading Topics</h2>
              <div className="h-64">
                {getTopicsChartData() && analytics.top_topics.length > 0 ? (
                  <Pie data={getTopicsChartData()} options={pieChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-blue-300">
                    <p>No topics data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reading Streak Line Chart */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-blue-100 mb-4">🔥 Reading Streak Progress</h2>
              <div className="h-64">
                {getStreakChartData() && (
                  <Line data={getStreakChartData()} options={chartOptions} />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-300">
                  Longest streak: <span className="font-semibold text-blue-100">{analytics.reading_streak.longest} days</span>
                </p>
              </div>
            </div>

            {/* Hourly Activity Chart */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-blue-100 mb-4">🕐 Reading Activity by Hour</h2>
              <div className="h-64">
                {getHourlyActivityChartData() && (
                  <Bar data={getHourlyActivityChartData()} options={chartOptions} />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-blue-300">
                  Most active time: <span className="font-semibold text-blue-100">{analytics.most_active_time.description}</span>
                </p>
              </div>
            </div>
          </div>          {/* Additional Stats */}
          <div className="mt-8 bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-blue-100 mb-4">📊 Reading Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{analytics.avg_weekly_reads}</p>
                <p className="text-sm text-blue-300">Average Weekly Reads</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{Object.keys(analytics.daily_read_log).length}</p>
                <p className="text-sm text-blue-300">Active Reading Days</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{analytics.top_topics.length}</p>
                <p className="text-sm text-blue-300">Different Topics Read</p>
              </div>
            </div>
          </div>
          
          {/* Badges Section */}
          {analytics.badges && analytics.badges.length > 0 && (
            <div className="mt-8 bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-blue-100 mb-4">🏆 Your Top Achievements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {analytics.badges.slice(0, 3).map((badge, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center border border-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
                        {badge.icon || '🏅'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-blue-100">{badge.name}</h3>
                      <p className="text-xs text-blue-300">{badge.description}</p>
                      {badge.earned_date && (
                        <p className="text-xs text-blue-400 mt-1">
                          Earned {new Date(badge.earned_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {analytics.badges.length > 3 && (
                <div className="text-center mt-4">
                  <a href="/profile" className="text-blue-400 text-sm hover:underline">
                    View all {analytics.badges.length} badges →
                  </a>
                </div>
              )}
            </div>
          )}
            {/* Invite Friends Card */}
          <div className="mt-8 bg-gray-900 rounded-lg shadow-sm p-6 border border-gray-700 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500 opacity-10 rounded-full"></div>
            <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-purple-500 opacity-10 rounded-full"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between relative z-10">
              <div>
                <h2 className="text-lg font-semibold text-blue-100 mb-1">👥 Invite Friends to newt</h2>
                <p className="text-blue-300 text-sm mb-4 sm:mb-0">
                  Share the joy of efficient reading with your friends and colleagues.
                </p>
              </div>
              <div>
                <button
                  onClick={() => {
                    const inviteLink = "https://newtreader.com/join?ref=" + analytics.user_id;
                    navigator.clipboard.writeText(inviteLink);
                    // Show feedback instead of alert
                    const button = document.getElementById('invite-button');
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Link Copied!
                    `;
                    button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    button.classList.add('bg-green-600');
                    setTimeout(() => {
                      button.innerHTML = originalText;
                      button.classList.remove('bg-green-600');
                      button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    }, 2000);
                  }}
                  id="invite-button"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Invitation Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
