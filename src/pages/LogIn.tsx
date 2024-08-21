import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import '../style/LogIn.css'


const LogIn: React.FC = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      email,
      password,
    });
  };

  return (
    <div className="login-form-container">
      <h1>{t('Onvi Monitoring')}</h1>
      <p>{t('Fill the form to login')}</p>

      <LanguageSelector />

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">{t('Email')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('Password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-form-submit">
          {t('form.submit')}
        </button>
      </form>
    </div>
  );
};

export default LogIn;
