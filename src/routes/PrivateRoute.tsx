import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/config/store/authSlice';
import useUserStore from '@/config/store/userSlice';

type Props = {
  element: React.ReactNode;
};

const PrivateRoute: React.FC<Props> = ({ element }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const jwtToken = useAuthStore((state) => state.tokens?.accessToken);
  const accessTokenExp = useAuthStore((state) => state.tokens?.accessTokenExp); // Get the expiration time of the access token

  const isTokenExpired = useCallback(() => {
    if (!accessTokenExp) return true;

    const currentTime = new Date();
    const tokenExpiryTime = new Date(accessTokenExp);

    return currentTime >= tokenExpiryTime; // Returns true if token is expired
  }, [accessTokenExp]);

  useEffect(() => {
    // Check if the token is expired or if user/token is missing
    const checkTokenExpiry = () => {
      if (!user || !jwtToken || !accessTokenExp || isTokenExpired()) {
        navigate('/login'); // If user or token is missing/expired, navigate to login
      }
    };

    checkTokenExpiry();
  }, [user, jwtToken, accessTokenExp, navigate, isTokenExpired]);

  if (!user || !jwtToken || !accessTokenExp || isTokenExpired()) {
    return <div>{t("loading")}</div>;
  }

  return element; 
};

export default PrivateRoute;
