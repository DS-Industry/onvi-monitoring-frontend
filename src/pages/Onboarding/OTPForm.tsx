import Button from '@/components/ui/Button/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { registerActivationUser } from '@/services/api/platform';
import { useClearUserData } from '@/hooks/useUserStore';
import { useSetAuthenticated } from '@/hooks/useAuthStore';
import { User } from '@/config/store/userSlice';

type Permissions = {
  action: string;
  subject: string;
};

type Props = {
  registerObj: { email: string };
  count: number;
  setCount: (count: number) => void;
  setRegisterUser: (user: User | null) => void;
  setRegisterPermissions: (permissions: Permissions[]) => void;
};

const OTPForm: React.FC<Props> = ({
  registerObj,
  count,
  setCount,
  setRegisterUser,
  setRegisterPermissions,
}: Props) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [otpString, setOtpString] = useState('');
  const [isError, setIsError] = useState(false);
  const clearData = useClearUserData();
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
      const result = await trigger();
      if (result && result.admin && result.permissionInfo) {
        const { admin, permissionInfo } = result;
        setRegisterUser(admin?.props);
        setAuthenticated(true);
        setRegisterPermissions(permissionInfo.permissions);
        setCount(count + 1);
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
