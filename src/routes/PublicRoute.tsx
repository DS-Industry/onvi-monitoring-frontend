import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../config/store/authSlice';

type PublicRouteProps = {
    element: React.ReactNode;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
    // Use the hook to access the state properly, avoiding frequent re-renders
    const jwtToken = useAuthStore((state) => state.tokens?.accessToken);

    // Only navigate if the jwtToken is present, avoiding infinite navigation cycles
    if (jwtToken) {
        return <Navigate to="/" replace />;
    }

    // Return the public route element if the user is not authenticated
    return element;
};

export default PublicRoute;
