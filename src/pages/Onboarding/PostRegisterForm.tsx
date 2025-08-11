import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { precreateOrganization } from '@/services/api/platform';
import { useSetAuthenticated, useSetPermissions } from '@/hooks/useAuthStore';
import { useClearUserData, useSetUser } from '@/hooks/useUserStore';
import { useToast } from '@/components/context/useContext';

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
};

type Token = {
  accessToken: string;
  accessTokenExp: Date;
  refreshToken: string;
  refreshTokenExp: Date;
};

type Permissions = {
  action: string;
  subject: string;
};

type Props = {
  registerUser: User;
  registerToken: Token;
  registerPermissions: Permissions[];
};

const PostRegisterForm: React.FC<Props> = ({
  registerUser,
  registerPermissions,
}: Props) => {
  const { t } = useTranslation();
  const [isToggled, setIsToggled] = useState(false);
  const setUser = useSetUser();
  const setAuthenticated = useSetAuthenticated();
  const setPermissions = useSetPermissions();
  const clearData = useClearUserData();
  const { showToast } = useToast();

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  const defaultValues = {
    fullName: '',
    organizationType: '',
    addressRegistration: '',
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  const { trigger, isMutating } = useSWRMutation(['precreate-org'], async () =>
    precreateOrganization({
      fullName: formData.fullName,
      organizationType: formData.organizationType,
      addressRegistration: formData.addressRegistration,
    })
  );

  type FieldType = 'fullName' | 'organizationType' | 'addressRegistration';

  const handleInputChange = (field: FieldType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async () => {
    try {
      const result = await trigger();
      if (result) {
        setUser({ user: registerUser });
        setAuthenticated(true);
        setPermissions(registerPermissions);
      }
    } catch (error) {
      console.error('Register error:', error);
      clearData();
      showToast(t('errors.other.registerError'), 'error');
    }
  };

  return (
    <div>
      <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1">
        {t('register.regis')}
      </p>
      <p className="font-normal text-text01 text-base mb-2">
        {t('register.for')}
      </p>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <DropdownInput
          title={t('register.specify')}
          options={[
            { value: 'LegalEntity', name: 'Юридическое лицо' },
            { value: 'IndividualEntrepreneur', name: 'ИП' },
          ]}
          classname="w-72"
          {...register('organizationType', {
            required: 'Organization Type is required',
          })}
          value={formData.organizationType}
          onChange={value => handleInputChange('organizationType', value)}
          error={!!errors.organizationType}
          helperText={errors.organizationType?.message}
        />
        <Input
          type="text"
          title={t('register.name')}
          value={formData.fullName}
          changeValue={e => handleInputChange('fullName', e.target.value)}
          error={!!errors.fullName}
          {...register('fullName', { required: 'Full Name is required' })}
          helperText={errors.fullName?.message || ''}
        />
        <Input
          type="text"
          title={t('register.car')}
          value={formData.addressRegistration}
          changeValue={e =>
            handleInputChange('addressRegistration', e.target.value)
          }
          error={!!errors.addressRegistration}
          {...register('addressRegistration', {
            required: 'Registration Address is required',
          })}
          helperText={errors.addressRegistration?.message}
        />
        <div
          className={`h-32 ${isToggled ? 'bg-background06' : 'bg-disabledFill'} mb-5`}
        >
          <div className="flex ml-5">
            <div className="mt-5 flex">
              <div>
                <div
                  onClick={handleToggle}
                  className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${
                    isToggled ? 'bg-primary02' : 'bg-opacity01'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      isToggled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
              <div className="ml-5">
                <div className="text-text01 text-lg font-semibold">
                  {t('register.request')}
                </div>
                <div className="text-text01 font-normal text-sm">
                  {t('register.after')}
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default PostRegisterForm;
