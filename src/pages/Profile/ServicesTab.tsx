import React, { useState } from 'react';
import Input from '@ui/Input/Input';
import Button from '@ui/Button/Button';
import useFormHook from '@/hooks/useFormHook'; 
import useSWRMutation from 'swr/mutation';
import { updateUserPassword } from '@/services/api/platform';

export const ServicesTab: React.FC = () => {


  const defaultValues = {
      password: "",
      newPassword: "",
      confirmPassword: ""
    };

  // Use custom form hook
  const { register, handleSubmit, errors, setValue } = useFormHook(defaultValues);


  const [formData, setFormData] = useState(defaultValues);

  // Handle input change for controlled inputs
  const handleInputChange = (field: any, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); // Update the internal state of react-hook-form
  };


  const { trigger: passwordUpdate, isMutating } = useSWRMutation('user/password',async() => updateUserPassword({
    oldPassword: formData.password,
    newPassword: formData.confirmPassword
  }))

  // Handle form submission
  const onSubmit = async (data: any) => {
    console.log('Form data:', data);
    // Handle form submission logic here
    try {
      const result = await passwordUpdate();
      if(result) {
        console.log(result);
      } else {
        throw new Error('Invalid password. Please try again.');
      }
    } catch(error) {
      console.log("Password change error: ", error);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          type={'password'}
          title='Текущий пароль'
          value={formData.password}
          label='Введите текущий пароль'
          changeValue={(e) => handleInputChange('password', e.target.value)}
          {...register('password', { required: 'пароль is required' })}
          disabled={false}
          inputType={'primary'}
          classname='w-80'
          error={!!errors.password}
          helperText={errors.password?.message}
        />
      </div>

      <div>
        <Input
          type={'password'}
          value={formData.newPassword}
          title='Новый пароль'
          label='Придумайте новый пароль'
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
          title='Подтвердите пароль'
          label='Подтвердите новый пароль'
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
        <Button form={true} title="Изменить пароль" classname='mt-5' isLoading={isMutating} />
      </div>
    </form>
  );
};
