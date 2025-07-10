import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const MyProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.user_id) {
      // Redirect to the actual profile page with user ID
      navigate(`/profile/${user.user_id}`);
    } else {
      // If no user, redirect to login
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-100">Redirecting to your profile...</p>
        </div>
      </div>
    </Layout>
  );
};

export default MyProfilePage;
