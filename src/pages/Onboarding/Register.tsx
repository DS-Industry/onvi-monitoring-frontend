import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { loginPlatformUser } from '../../services/api/platform';
// import useSWRMutation from 'swr/mutation';
// import { useSetUser, useClearUserData } from '../../hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
// import SearchInput from '@ui/Input/SearchInput';
// import DropdownInput from '@ui/Input/DropdownInput';
// import MultilineInput from '@ui/Input/MultilineInput';
// import useAuthStore from '@/config/store/authSlice';
// import useFormHook from '@/hooks/useFormHook';
import { ArrowLeft } from 'feather-icons-react';
import ToggleSwitch from '@/assets/Toggle.png';
import RegisterImage from '@/assets/RegisterImage.svg';
import PostRegisterImage from '@/assets/PostRegisterImage.svg';
import OTPImage from '@/assets/OTPImage.svg';
import RegisterForm from './RegisterForm';
import OTPForm from './OTPForm';
import PostRegisterForm from './PostRegisterForm';
import OnviBlue from '@/assets/onvi_blue.png';

const Register: React.FC = () => {
  const { t } = useTranslation();

  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const handleLoginNavigate = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/login');
  }

  const [registerObj, setRegisterObj] = useState({ email: '' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background02 p-4">
      <div className="grid lg:grid-cols-2 gap-4 w-full lg:w-[80%] p-8 lg:p-0 rounded-lg">

        {/* Form Section */}
        <div className="p-8 lg:w-full">
          <div className='flex text-primary02 mb-5'>
            <ArrowLeft />
            <p>Назад</p>
          </div>
          <div className='flex mb-5'>
            <img src={OnviBlue} className='h-7 w-14' />
            <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">БИЗНЕС</div>
          </div>
          {count === 0 && <RegisterForm count={count} setCount={setCount} registerObj={registerObj} setRegisterObj={setRegisterObj} />}
          {count === 1 && <OTPForm registerObj={registerObj} />}
          {count === 2 && <PostRegisterForm />}
          <p className="mt-6 text-center text-sm text-opacity01">
            {t('Нажимая кнопку “Зарегестрироваться”, вы принимаете условия')}{' '}
          </p>
          <p className="text-center text-sm text-text01">
            {t('Политики конфиденциальности')}
          </p>
          <p className="mt-6 text-center text-sm text-opacity01">
            {t('У вас есть учетной записи?')}{' '}
            <span
              className="text-primary02 hover:text-primary02_Hover font-medium cursor-pointer"
              onClick={handleLoginNavigate}
            >
              {t('Войти!')}
            </span>
          </p>

        </div>

        {/* Image Section */}
        <div className="p-8 hidden lg:flex fixed right-0 top-0 h-screen w-[50%] justify-center items-center">
          <div className="p-8">
            {count === 0 && <img src={RegisterImage} alt="Rocket illustration" key={"register-image-1"} className="object-contain max-w-full max-h-full" />}
            {count === 1 && <img src={OTPImage} alt="Rocket illustration" key={"register-image-2"} className="object-contain max-w-full max-h-full" />}
            {count === 2 && <img src={PostRegisterImage} alt="Rocket illustration" key={"register-image-3"} className="object-contain max-w-full max-h-full" />}
          </div>
        </div>

      </div>
    </div>
  );

};

export default Register;
