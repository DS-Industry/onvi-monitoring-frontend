import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/LogIn.css'
import { loginPlatformUser } from '../services/api/platform';
import useSWR from 'swr';
import { useSetUser,useClearUserData } from '../hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useSetTokens } from '../hooks/useAuthStore';
import Button from '@ui/Button/Button';
import Input from '@ui/Input/Input';


const LogIn: React.FC = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { error: userError, mutate, isLoading } = useSWR([`user/auth/login`], () => loginPlatformUser({ email, password}))

  const setUser = useSetUser();
  const clearData = useClearUserData();
  const setTokens = useSetTokens();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(email === '')
      setEmailError(true);
    if(password === '')
      setPasswordError(true);
    setErrorMessage('');
    // Handle form submission logic here
    const result = await mutate();
    if(result && result.admin && result.tokens) {
      console.log(result)

      const { admin, tokens } = result;
      setUser({user: admin?.props});
      setTokens({tokens});
      navigate("/");
    }
    else {
      console.log(userError);
      setEmailError(true);
      setPasswordError(true);
      setErrorMessage(t('Invalid email or password. Please try again.'));
      clearData();
    }
  };

  
  return (
    <div className="login-form-container">
      <h1>{t('Onvi Monitoring')}</h1>
      <p>{t('Fill the form to login')}</p>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">{t('Email')}</label>
          <Input
            type="email"
            value={email}
            changeValue={(e) => setEmail(e.target.value)}
            error={emailError}
            label="Enter your email"
            helperText={emailError ? "Please enter correct email" : ""}
            inputType="primary"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('Password')}</label>
          <Input
            type="password"
            value={password}
            changeValue={(e) => setPassword(e.target.value)}
            error={passwordError}
            label="Enter your password"
            helperText={passwordError ? "Please enter correct password" : ""}
            inputType="primary"
          />
        </div>

        <Button type="outline" title='Login' form={true} isLoading={isLoading} />
      </form>
    </div>
  );
};

export default LogIn;
