import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-100">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login page with the current location
  if (!isAuthenticated) {
    return <Navigate to="/join" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
