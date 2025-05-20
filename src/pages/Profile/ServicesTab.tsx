import React, { useState } from 'react';
import Input from '@ui/Input/Input';
import Button from '@ui/Button/Button';
import useFormHook from '@/hooks/useFormHook'; 
import useSWRMutation from 'swr/mutation';
import { updateUserPassword } from '@/services/api/platform';
import { useNavigate } from 'react-router-dom';
import { useSetUser } from '@/hooks/useUserStore';
import { useTranslation } from 'react-i18next';

const ServicesTab: React.FC = () => {
  const { t } = useTranslation();
  const defaultValues = {
      password: "",
      newPassword: "",
      confirmPassword: ""
    };

  const navigate = useNavigate();

  const { register, handleSubmit, errors, setValue } = useFormHook(defaultValues);


  const [formData, setFormData] = useState(defaultValues);
  const [passwordError, setPasswordError] = useState(false);
  const [errorPasswordMessage, setErrorPasswordMessage] = useState('');
  const setUser = useSetUser(); 

  type FieldType = "password" | "newPassword" | "confirmPassword";

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); 
  };


  const { trigger: passwordUpdate, isMutating } = useSWRMutation('user/password',async() => updateUserPassword({
    oldPassword: formData.password,
    newPassword: formData.confirmPassword
  }))

  const onSubmit = async () => {
    try {
      const result = await passwordUpdate();
      if(result) {
        setUser({ user: result?.props })
        setPasswordError(false);
        setErrorPasswordMessage('');
        navigate('/');
      } else {
        throw new Error('Invalid password. Please try again.');
      }
    } catch(error) {
      setPasswordError(true);
      setErrorPasswordMessage('Enter the correct password.');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          type={'password'}
          title={t("profile.current")}
          value={formData.password}
          label={t("profile.enterCurrent")}
          changeValue={(e) => handleInputChange('password', e.target.value)}
          {...register('password', { required: 'пароль is required' })}
          disabled={false}
          inputType={'primary'}
          classname='w-80'
          error={!!errors.password || !!passwordError}
          helperText={errors.password?.message || errorPasswordMessage || ''}
        />
      </div>

      <div>
        <Input
          type={'password'}
          value={formData.newPassword}
          title={t("profile.new")}
          label={t("profile.createNew")}
          changeValue={(e) => handleInputChange('newPassword', e.target.value)}
          {...register('newPassword', { required: 'New password is required' })}
          disabled={false}
          inputType={'primary'}
          classname='w-80'
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
        />
      </div>

      <div>
        <Input
          type={'password'}
          value={formData.confirmPassword}
          title={t("profile.confirm")}
          label={t("profile.confirmNew")}
          changeValue={(e) => handleInputChange('confirmPassword', e.target.value)}
          {...register('confirmPassword', {
            required: 'Confirmation is required',
            validate: (value) =>
              value === formData.newPassword || 'Passwords do not match' // Custom validation rule
          })}
          disabled={false}
          inputType={'primary'}
          classname='w-80'
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
      </div>
      
      <div className="flex">
        <Button form={true} title={t("profile.changePass")} classname='mt-5' isLoading={isMutating} />
      </div>
    </form>
  );
};

export default ServicesTab;
