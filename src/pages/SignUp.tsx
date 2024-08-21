import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import '../style/SignUp.css'
const SignUp: React.FC = () => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [timezone, setTimezone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      name,
      surname,
      middlename,
      birthday,
      phone,
      email,
      password,
      gender,
      status,
      avatar,
      country,
      countryCode,
      timezone,
    });
  };

  return (
    <div className="signup-form-container">
      <h1>{t('Onvi Monitoring')}</h1>
      <p>{t('Fill the form in your preferred language')}</p>

      <LanguageSelector />

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="name">{t('Name')}</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="surname">{t('Surname')}</label>
          <input
            id="surname"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="middlename">{t('Middlename')}</label>
          <input
            id="middlename"
            type="text"
            value={middlename}
            onChange={(e) => setMiddlename(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthday">{t('Birthday')}</label>
          <input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">{t('Phone')}</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="gender">{t('Gender')}</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
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
            onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">{t('Country')}</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="countryCode">{t('CountryCode')}</label>
          <input
            id="countryCode"
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="timezone">{t('Timezone')}</label>
          <input
            id="timezone"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
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
