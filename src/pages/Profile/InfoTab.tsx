import React, { useState, useEffect, useMemo } from 'react';
import useFormHook from '@/hooks/useFormHook';
import { useUser } from '@/hooks/useUserStore';
import { updateUserProfile } from '@/services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser } from '@/hooks/useUserStore';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/context/useContext';
import { Button, Form, Input } from 'antd';
import { formatRussianPhone } from '@/utils/tableUnits';

const InfoTab: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const user = useUser();
  const setUser = useSetUser();
  const { showToast } = useToast();

  const userName = { name: user.name, middlename: user.middlename };

  const defaultValues = useMemo(
    () => ({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      middlename: user.middlename || '',
      surname: user.surname || '',
      imagePreview: user.avatar
        ? `${import.meta.env.VITE_S3_CLOUD}/avatar/user/` + user.avatar
        : null,
    }),
    [user]
  );

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  const { trigger: updateUser, isMutating } = useSWRMutation('user', async () =>
    updateUserProfile(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        middlename: formData.middlename,
        surname: formData.surname,
      },
      selectedFile
    )
  );

  useEffect(() => {
    const storedAvatarUrl =
      localStorage.getItem('avatarUrl') || defaultValues.imagePreview;
    if (storedAvatarUrl) {
      setImagePreview(storedAvatarUrl);
    }
  }, [defaultValues.imagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  type FieldName = 'name' | 'email' | 'phone' | 'middlename' | 'surname';

  const handleInputChange = (field: FieldName, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    let cleanValue = '+7' + input.replace(/\D/g, '').replace(/^7/, '');
    if (cleanValue.length > 12) cleanValue = cleanValue.slice(0, 12);

    setFormData(prev => ({ ...prev, phone: cleanValue }));
    setValue('phone', cleanValue);
  };

  const onSubmit = async () => {
    try {
      const updateUserData = await updateUser();

      if (updateUserData.props.avatar) {
        const avatarUrl =
          `${import.meta.env.VITE_S3_CLOUD}/avatar/user/` +
            `${updateUserData.props.avatar}` || null;
        setImagePreview(avatarUrl);
        localStorage.setItem('avatarUrl', avatarUrl || '');
      }

      const [updatedData] = await Promise.all([updateUserData]);

      if (updatedData) {
        setUser({ user: updatedData?.props });
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(t('errors.other.errorUpdatingProfile'), 'error');
    }
  };

  return (
    <div className="max-w-6xl mr-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex flex-col w-full">
            <div>
              <div className="flex">
                <div className="text-text02 text-sm">{t('profile.name')}</div>
                <span className="text-errorFill">*</span>
              </div>
              <Form.Item
                help={errors.name?.message}
                validateStatus={errors.name ? 'error' : undefined}
              >
                <Input
                  placeholder={t('profile.namePlaceholder')}
                  className="w-80 sm:w-96"
                  {...register('name', {
                    required: t('validation.nameRequired'),
                  })}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  status={errors.name ? 'error' : ''}
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">
                {t('profile.middlename')}
              </div>
              <Form.Item>
                <Input
                  placeholder={t('profile.middlenamePlaceholder')}
                  className="w-80 sm:w-96"
                  {...register('middlename')}
                  value={formData.middlename}
                  onChange={e =>
                    handleInputChange('middlename', e.target.value)
                  }
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('profile.surname')}</div>
              <Form.Item>
                <Input
                  placeholder={t('profile.surnamePlaceholder')}
                  className="w-80 sm:w-96"
                  {...register('surname')}
                  value={formData.surname}
                  onChange={e => handleInputChange('surname', e.target.value)}
                />
              </Form.Item>
            </div>
            <div>
              <div className="flex">
                <div className="text-text02 text-sm">
                  {t('profile.telephone')}
                </div>
                <span className="text-errorFill">*</span>
              </div>
              <Form.Item
                help={errors.phone?.message}
                validateStatus={errors.phone ? 'error' : undefined}
              >
                <Input
                  placeholder={t('profile.telephonePlaceholder')}
                  className="w-80 sm:w-96"
                  {...register('phone', {
                    required: t('validation.phoneRequired'),
                    pattern: {
                      value: /^\+7\d{10}$/,
                      message: t('validation.phoneValidFormat'),
                    },
                  })}
                  value={formatRussianPhone(formData.phone)}
                  onChange={handlePhoneChange}
                  status={errors.phone ? 'error' : ''}
                />
              </Form.Item>
            </div>
            <div>
              <div className="flex">
                <div className="text-text02 text-sm">Email</div>
                <span className="text-errorFill">*</span>
              </div>
              <Form.Item
                help={errors.email?.message}
                validateStatus={errors.email ? 'error' : undefined}
              >
                <Input
                  placeholder={t('profile.emailPlaceholder')}
                  className="w-80 sm:w-96"
                  {...register('email', {
                    required: t('validation.emailRequired'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format',
                    },
                  })}
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  status={errors.email ? 'error' : ''}
                  disabled={true}
                />
              </Form.Item>
            </div>
            <div className="flex">
              <input type="checkbox" />
              <div className="ml-2 text-text02 text-base">
                {t('profile.agree')}
              </div>
            </div>
            <div className="my-6">
              <div className="text-text02">{t('routes.lan')}</div>
              <LanguageSelector />
            </div>
          </div>
          <div className="flex flex-col items-center md:ml-auto lg:ml-40 w-full md:w-1/3">
            <div>{t('profile.photo')}</div>

            {imagePreview ? (
              <div className="relative w-36 h-36 rounded-full bg-[#bffa00] flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <Avatar type="profile" userName={userName} />
            )}

            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="w-36 flex justify-center items-center text-primary02 cursor-pointer"
              >
                {t('profile.changePh')}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <Button
            htmlType="submit"
            className="mb-10"
            loading={isMutating}
            type="primary"
          >
            {t('profile.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InfoTab;
