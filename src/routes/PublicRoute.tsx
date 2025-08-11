import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/config/store/authSlice';
import useUserStore from '@/config/store/userSlice';

type PublicRouteProps = {
  element: React.ReactNode;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useUserStore(state => state.user);

  // If authenticated and user exists, navigate to home
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the public route
  return element;
};

export default PublicRoute;
