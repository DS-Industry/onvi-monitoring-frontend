import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowLeft from 'feather-icons-react';
import RegisterImage from '@/assets/RegisterImage.png';
import PostRegisterImage from '@/assets/PostRegisterImage.png';
import OTPImage from '@/assets/OTPImage.png';
const RegisterForm = React.lazy(() => import('./RegisterForm'));
const OTPForm = React.lazy(() => import('./OTPForm'));
const PostRegisterForm = React.lazy(() => import('./PostRegisterForm'));

import OnviBlue from '@/assets/onvi_blue.png';

type User = {
  id: number;
  userRoleId: number;
  name: string;
  surname: string;
  middlename?: string;
  birthday?: Date;
  phone?: string;
  email: string;
  password: string;
  gender: string;
  position: string;
  status: string;
  avatar?: string;
  country: string;
  countryCode: number;
  timezone: number;
  refreshTokenId: string;
  receiveNotifications: number;
  createdAt: Date;
  updatedAt: Date;
}

type Token = {
  accessToken: string;
  accessTokenExp: Date;
  refreshToken: string;
  refreshTokenExp: Date;
}

type Permissions = {
  action: string;
  subject: string;
}

const Register: React.FC = () => {
  const { t } = useTranslation();

  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const handleLoginNavigate = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/login');
  }

  const [registerObj, setRegisterObj] = useState({ email: '' });
  const [registerUser, setRegisterUser] = useState<User | null>(null);
  const [registerToken, setRegisterToken] = useState<Token | null>(null);
  const [registerPermissions, setRegisterPermissions] = useState<Permissions[]>([]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background02 p-4">
      <div className="grid lg:grid-cols-2 gap-4 w-full lg:w-[80%] p-8 lg:p-0 rounded-lg">

        <div className="p-8 lg:w-full">
          <div className='flex text-primary02 mb-5'>
            <ArrowLeft icon={'arrow-left'} />
            <p>{t("login.back")}</p>
          </div>
          <div className='flex mb-5'>
            <img src={OnviBlue} className='h-7 w-14' loading="lazy" />
            <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">{t("login.business")}</div>
          </div>
          {count === 0 && (
            <RegisterForm
              count={count}
              setCount={setCount}
              registerObj={registerObj}
              setRegisterObj={setRegisterObj}
            />)}
          {count === 1 && (
            <OTPForm
              registerObj={registerObj}
              count={count}
              setCount={setCount}
              setRegisterUser={setRegisterUser}
              setRegisterToken={setRegisterToken}
              setRegisterPermissions={setRegisterPermissions}
            />)}
          {count === 2 && registerUser && registerToken && registerPermissions && (
            <PostRegisterForm
              registerUser={registerUser}
              registerToken={registerToken}
              registerPermissions={registerPermissions}
            />)}
          <p className="mt-6 text-center text-sm text-opacity01">
            {t('register.terms')}{' '}
          </p>
          <p className="text-center text-sm text-text01">
            {t('register.privacy')}
          </p>
          <p className="mt-6 text-center text-sm text-opacity01">
            {t('register.do')}{' '}
            <span
              className="text-primary02 hover:text-primary02_Hover font-medium cursor-pointer"
              onClick={handleLoginNavigate}
            >
              {t(`${t('login.login')}!`)}
            </span>
          </p>

        </div>

        <div className="p-8 hidden lg:flex fixed right-0 top-0 h-screen w-[50%] justify-center items-center">
          <div className="p-8">
            {count === 0 && <img src={RegisterImage} alt="Rocket illustration" key={"register-image-1"} className="object-contain max-w-full max-h-full" loading="lazy" decoding='async' fetchPriority='low' />}
            {count === 1 && <img src={OTPImage} alt="Rocket illustration" key={"register-image-2"} className="object-contain max-w-full max-h-full" loading="lazy" decoding='async' fetchPriority='low' />}
            {count === 2 && <img src={PostRegisterImage} alt="Rocket illustration" key={"register-image-3"} className="object-contain max-w-full max-h-full" loading="lazy" decoding='async' fetchPriority='low' />}
          </div>
        </div>

      </div>
    </div>
  );

};

export default Register;
