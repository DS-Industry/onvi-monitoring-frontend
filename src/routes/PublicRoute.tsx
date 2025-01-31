import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../config/store/authSlice';

type PublicRouteProps = {
  element: React.ReactNode;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const jwtToken = useAuthStore((state) => state.tokens?.accessToken);
  const accessTokenExp = useAuthStore((state) => state.tokens?.accessTokenExp);

  const isTokenExpired = () => {
    if (!accessTokenExp) return false;

    const currentTime = new Date();
    const tokenExpiryTime = new Date(accessTokenExp);
    
    return currentTime >= tokenExpiryTime; // Returns true if token is expired
  };

  // If jwtToken exists and is not expired, navigate to home
  if (jwtToken && !isTokenExpired()) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the public route
  return element;
};

export default PublicRoute;
