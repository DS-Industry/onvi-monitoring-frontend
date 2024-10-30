import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loginPlatformUser } from '@/services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser, useClearUserData } from '@/hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useSetPermissions, useSetTokens } from '@/hooks/useAuthStore';
import Button from '@ui/Button/Button';
import Input from '@ui/Input/Input';
import useFormHook from '@/hooks/useFormHook';
import LoginImage from '@/assets/LoginImage.svg';
import ArrowLeft from 'feather-icons-react';
import OnviBlue from '@/assets/onvi_blue.png';
// import LanguageSelector from '@/components/LanguageSelector';

const LogIn: React.FC = () => {
  const { t } = useTranslation();

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorEmailMessage, setErrorEmailMessage] = useState('');
  const [errorPasswordMessage, setErrorPasswordMessage] = useState('');
  const navigate = useNavigate();

  const handleRegisterNavigate = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/register');
  }

  const handleForgotrNavigate = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/forgotPassword');
  }

  const defaultValues = {
    loginEmail: '',
    loginPassword: ''
  };

  const [formData, setFormData] = useState(defaultValues);

  const { trigger, isMutating } = useSWRMutation(
    'user/auth/login',
    async () => loginPlatformUser({ email: formData.loginEmail, password: formData.loginPassword }) // Fetcher function
  );

  const setUser = useSetUser();
  const clearData = useClearUserData();
  const setTokens = useSetTokens();
  const setPermissions = useSetPermissions();

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  type FieldName = 'loginEmail' | 'loginPassword';

  const handleInputChange = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); 
  };

  const onSubmit = async (data: { loginEmail: string, loginPassword: string }) => {

    if (!data.loginEmail) setEmailError(true);
    if (!data.loginPassword) setPasswordError(true);
    try {
      const result = await trigger();

      if (result && result.admin && result.tokens) {
        const { admin, tokens, permissionInfo } = result;
        setUser({ user: admin?.props });
        setTokens({ tokens });
        setPermissions(permissionInfo.permissions)
        navigate('/');
      } else {
        throw new Error(t('Invalid email or password. Please try again.'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setEmailError(true);
      setPasswordError(true);
      setErrorEmailMessage(t('Please enter correct Email Id.'));
      setErrorPasswordMessage(t('Please enter correct Password.'));
      clearData();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background02 p-4">
      <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
        <div className="lg:w-5/12 p-8 lg:ml-40">
          <div className='flex text-primary02 mb-5'>
            <ArrowLeft icon={'arrow-left'} />
            <p>{t("login.back")}</p>
          </div>
          <div className='flex mb-5'>
            <img src={OnviBlue} className='h-7 w-14' />
            <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">{t('login.business')}</div>
          </div>
          <h1 className="text-2xl font-extrabold leading-[1.25] text-text01 mb-2">{t('login.welcome')}</h1>
          <p className="text-text01 mb-6">{t('login.glad')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                type="text"
                label='Email'
                title='Email'
                value={formData.loginEmail}
                changeValue={(e) => handleInputChange('loginEmail', e.target.value)}
                error={!!errors.loginEmail || !!emailError}
                {...register('loginEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format'
                  }
                })}
                helperText={errors.loginEmail?.message || errorEmailMessage || ''}
              />
            </div>

            <div>
              <Input
                type="password"
                label={t('login.password')}
                title={t('login.password')}
                value={formData.loginPassword}
                changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                error={!!errors.loginPassword || !!passwordError}
                {...register('loginPassword', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input type="checkbox" className="rounded text-primary02 border-gray-300 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-text02">{t('login.remember')}</span>
              </label>
              <span
                className="text-sm text-primary02 cursor-pointer hover:text-primary02_Hover"
                onClick={handleForgotrNavigate}
              >
                {t('login.forgot')}
              </span>
            </div>

            <Button type="basic" title={t('login.login')} form={true} isLoading={isMutating} classname='w-full' />
          </form>

          <p className="mt-6 text-center text-sm text-text02">
            {t('login.dont')}{' '}
            <span
              className="text-primary02 hover:text-primary02_Hover font-medium cursor-pointer"
              onClick={handleRegisterNavigate}
            >
              {t('login.register')}
            </span>
          </p>
          {/* <LanguageSelector /> */}
        </div>

        <div className="hidden lg:flex lg:w-8/12 rounded-r-lg lg:ml-20">
          <div className='p-8'>
            <img src={LoginImage} alt="Rocket illustration" key={"login-image"} className="object-cover w-11/12 h-11/12" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
