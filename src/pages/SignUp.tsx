import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import '../style/SignUp.css';

const SignUp: React.FC = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    middlename: '',
    birthday: '',
    phone: '',
    email: '',
    password: '',
    gender: '',
    status: 'ACTIVE',
    avatar: null as File | null,
    country: '',
    countryCode: '',
    timezone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, files } = e.target;
    setFormData({
      ...formData,
      [id]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="signup-form-container">
      <h1>{t('Onvi Monitoring')}</h1>
      <p>{t('Fill the form in your preferred language')}</p>

      <LanguageSelector />

      <form onSubmit={handleSubmit} className="signup-form">
        {['name', 'surname', 'middlename', 'birthday', 'phone', 'email', 'password', 'country', 'countryCode', 'timezone'].map((field) => (
          <div className="form-group" key={field}>
            <label htmlFor={field}>{t(field)}</label>
            <input
              id={field}
              type={field === 'birthday' ? 'date' : field === 'email' ? 'email' : 'text'}
              value={formData[field as keyof typeof formData] as string}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="gender">{t('Gender')}</label>
          <select id="gender" value={formData.gender} onChange={handleChange}>
            <option value="male">{t('form.male')}</option>
            <option value="female">{t('form.female')}</option>
            <option value="other">{t('form.other')}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="avatar">{t('avatar')}</label>
          <input
            id="avatar"
            type="file"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="signup-form-submit">
          {t('form.submit')}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
