import Button from '@/components/ui/Button/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import {
  registerActivationUser,
  loginPlatformUser,
} from '@/services/api/platform';
import { useClearUserData, useSetUser } from '@/hooks/useUserStore';
import { useSetAuthenticated } from '@/hooks/useAuthStore';
import useAuthStore from '@/config/store/authSlice';

type Props = {
  registerObj: { email: string; password: string };
};

const OTPForm: React.FC<Props> = ({ registerObj }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpString, setOtpString] = useState('');
  const [isError, setIsError] = useState(false);
  const clearData = useClearUserData();
  const setUser = useSetUser();
  const setAuthenticated = useSetAuthenticated();

  const defaultValues = {
    confirmString: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { handleSubmit, setValue } = useFormHook(formData);

  const { trigger, isMutating } = useSWRMutation(
    'user/auth/activation',
    async () =>
      registerActivationUser({
        email: registerObj.email,
        confirmString: `${otpString.substring(0, 3)}-${otpString.substring(3)}`,
      })
  );

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index == 5) {
        const newOtpString = newOtp.join('');
        setOtpString(newOtpString);
        setValue('confirmString', newOtpString);
        setFormData(prev => ({ ...prev, ['confirmString']: value }));
      }
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && otp[index] === '') {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const onSubmit = async () => {
    try {
      await trigger();
      const loginResult = await loginPlatformUser({
        email: registerObj.email,
        password: registerObj.password,
      });
      if (loginResult && loginResult.admin && loginResult.permissionInfo) {
        const { admin, permissionInfo } = loginResult;
        setUser({
          user: {
            ...admin?.props,
            organizations: permissionInfo.organizations ?? [],
            organizationId: permissionInfo.organizations?.at(0)?.id,
          },
        });
        useAuthStore.getState().setPermissions(permissionInfo.permissions);
        setAuthenticated(true);
        navigate('/');
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      clearData();
    }
  };

  return (
    <div>
      <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1 mt-16">
        {t('register.enter')}
      </p>
      <p className="font-normal text-text01 text-base">
        {t('register.otpEmail')}
      </p>
      <p className="font-normal text-text01 text-base">{registerObj.email}</p>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center space-x-4 mt-10">
          {otp.map((value, index) => (
            <React.Fragment key={index}>
              <input
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={value}
                onChange={e => handleChange(e.target.value, index)}
                onKeyDown={e => e.key === 'Backspace' && handleBackspace(index)}
                className={`w-8 h-12 text-center bg-background02 text-text01 border ${isError ? 'border-errorFill' : 'border-[#E4E5E7]'} rounded-lg text-2xl focus:outline-none`}
              />
              {index === 2 && (
                <span className="text-2xl text-[#e4e5e7] font-semibold self-center">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        {isError && (
          <p className="text-errorFill text-center mt-2">
            {t('register.wrong')}
          </p>
        )}

        <Button
          type="basic"
          title={t('register.register')}
          form={true}
          classname="w-full"
          isLoading={isMutating}
        />
      </form>
    </div>
  );
};

export default OTPForm;
