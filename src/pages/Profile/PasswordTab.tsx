import React, { useState } from 'react';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { updateUserPassword } from '@/services/api/platform';
import { useNavigate } from 'react-router-dom';
import { useSetUser } from '@/hooks/useUserStore';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useToast } from '@/components/context/useContext';

const PasswordTab: React.FC = () => {
  const { t } = useTranslation();
  const defaultValues = {
    password: '',
    newPassword: '',
    confirmPassword: '',
  };

  const navigate = useNavigate();

  const { register, handleSubmit, errors, setValue } =
    useFormHook(defaultValues);

  const [formData, setFormData] = useState(defaultValues);
  const [passwordError, setPasswordError] = useState(false);
  const [errorPasswordMessage, setErrorPasswordMessage] = useState('');
  const setUser = useSetUser();
  const { showToast } = useToast();

  type FieldType = keyof typeof defaultValues;

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const { trigger: passwordUpdate, isMutating } = useSWRMutation(
    'user/password',
    async () =>
      updateUserPassword({
        oldPassword: formData.password,
        newPassword: formData.confirmPassword,
      })
  );

  const onSubmit = async () => {
    try {
      const result = await passwordUpdate();
      if (result) {
        setUser({ user: result?.props });
        setPasswordError(false);
        setErrorPasswordMessage('');
        showToast(t('routes.savedSuccessfully'), 'success');
        navigate('/');
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      setPasswordError(true);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      setErrorPasswordMessage(t('validation.enterCorrectPassword') || '');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className="flex">
          <div className="text-text02 text-sm">{t('profile.current')}</div>
          <span className="text-errorFill">*</span>
        </div>
        <Form.Item
          help={errors.password?.message}
          validateStatus={errors.password ? 'error' : undefined}
        >
          <Input.Password
            placeholder={t('profile.enterCurrent')}
            className="w-80 sm:w-96"
            {...register('password', {
              required: t('validation.passwordRequired') || errorPasswordMessage,
            })}
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            status={errors.password || passwordError ? 'error' : ''}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </div>
      <div>
        <div className="flex">
          <div className="text-text02 text-sm">{t('profile.new')}</div>
          <span className="text-errorFill">*</span>
        </div>
        <Form.Item
          help={errors.newPassword?.message}
          validateStatus={errors.newPassword ? 'error' : undefined}
        >
          <Input.Password
            placeholder={t('profile.createNew')}
            className="w-80 sm:w-96"
            {...register('newPassword', {
              required: t('validation.passwordRequired'),
            })}
            value={formData.newPassword}
            onChange={e => handleInputChange('newPassword', e.target.value)}
            status={errors.newPassword ? 'error' : ''}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </div>
      <div>
        <div className="flex">
          <div className="text-text02 text-sm">{t('profile.confirm')}</div>
          <span className="text-errorFill">*</span>
        </div>
        <Form.Item
          help={errors.confirmPassword?.message}
          validateStatus={errors.confirmPassword ? 'error' : undefined}
        >
          <Input.Password
            placeholder={t('profile.confirmNew')}
            className="w-80 sm:w-96"
            {...register('confirmPassword', {
              required: t('validation.passwordRequired'),
              validate: value =>
                value === formData.newPassword || t('validation.passwordNotMatch'),
            })}
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            status={errors.confirmPassword ? 'error' : ''}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
      </div>
      <div className="flex">
        <Button
          htmlType='submit'
          className="mt-5"
          loading={isMutating}
          type='primary'
        >
          {t('profile.changePass')}
        </Button>
      </div>
    </form>
  );
};

export default PasswordTab;
