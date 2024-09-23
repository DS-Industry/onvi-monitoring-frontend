import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../config/store/authSlice';
import useUserStore from '../config/store/userSlice';

type Props = {
    element: React.ReactNode;
};

const PrivateRoute: React.FC<Props> = ({ element }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user); 
    const jwtToken = useAuthStore((state) => state.tokens?.accessToken);
    console.log(user);
    console.log(jwtToken);
  
    useEffect(() => {
      if (!user && !jwtToken) {
        navigate('/login');  
      }
    }, [user, jwtToken, navigate]);
  
    if (!user || !jwtToken) {
      return <div>{t("loading")}</div>; 
    }
  
    return element;
  };
  

export default PrivateRoute;