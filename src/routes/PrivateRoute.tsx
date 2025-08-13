import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsAuthenticated, useCheckAuth, useSetAuthenticated } from '@/hooks/useAuthStore';
import useUserStore from '@/config/store/userSlice';

type Props = {
  element: React.ReactNode;
};

const PrivateRoute: React.FC<Props> = ({ element }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const isAuthenticated = useIsAuthenticated();
  const checkAuth = useCheckAuth();
  const setAuthenticated = useSetAuthenticated();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const isValid = await checkAuth();
        if (!isValid || !user) {
          setAuthenticated(false);
          navigate('/login');
        }
      } catch (error) {
        setAuthenticated(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated || !user) {
      validateAuth();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, checkAuth, setAuthenticated, navigate]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>{t('loading')}</div>;
  }

  return element;
};

export default PrivateRoute;
