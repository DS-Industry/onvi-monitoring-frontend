import React, { useState, useEffect, useMemo } from 'react';
import { Input as AntInput, Form } from 'antd';
import Button from '@ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import { useClearUserData, useUser } from '@/hooks/useUserStore';
import { updateUserProfile } from '@/services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser } from '@/hooks/useUserStore';
import { useTranslation } from 'react-i18next';
import { useClearJwtToken, useClearPermissions, useSetPermissions } from '@/hooks/useAuthStore';
import LanguageSelector from '@/components/LanguageSelector';
import useAuthStore from '@/config/store/authSlice';
import Avatar from '@/components/ui/Avatar';

const InfoTab: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const user = useUser();
  const setUser = useSetUser();
  const setClearUser = useClearUserData();
  const setClearToken = useClearJwtToken();
  const setClearPermissions = useClearPermissions();
  const setPermissions = useSetPermissions();

  const userName = { name: user.name, middlename: user.middlename };

  const defaultValues = useMemo(
    () => ({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      middlename: user.middlename || '',
      surname: user.surname || '',
      imagePreview: user.avatar ? "https://storage.yandexcloud.net/onvi-business/avatar/user/" + user.avatar : null,
    }),
    [user]
  );

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  const { trigger: updateUser, isMutating } = useSWRMutation('user', async () => updateUserProfile({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    middlename: formData.middlename,
    surname: formData.surname,
  }, selectedFile));

  useEffect(() => {
    const storedAvatarUrl = localStorage.getItem('avatarUrl') || defaultValues.imagePreview;
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value);
  };

  const onSubmit = async (data: unknown) => {
    console.log('Form Data:', data);
    try {
      const updateUserData = updateUser();

      if ((await updateUserData).props.avatar) {
        const avatarUrl = "https://storage.yandexcloud.net/onvi-business/avatar/user/" + `${(await updateUserData).props.avatar}` || null;
        setImagePreview(avatarUrl);
        localStorage.setItem('avatarUrl', avatarUrl || ""); // Store the avatar URL in localStorage for persistence
      }

      const [updatedData] = await Promise.all([updateUserData]);

      if (updatedData) {
        console.log('User profile updated:', updatedData);
        setUser({ user: updatedData?.props });
      } else {
        throw new Error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();

    setClearUser();
    setClearToken();
    setClearPermissions();
    setPermissions([]);

    useAuthStore.getState().reset();

    window.location.href = "";
  };

  console.log("Image Preview: ", imagePreview);

  return (
    <div className="max-w-6xl mr-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex flex-col space-y-6 w-full md:w-2/3">
          <Form.Item label={t("profile.name")}>
            <AntInput
              placeholder={t("profile.name")}
              value={formData?.name}
              onChange={(e) => {
                handleInputChange('name', e.target.value);
                register('name').onChange(e);
              }}
              className='w-80'
              status={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </Form.Item>
          <Form.Item label={t("profile.middlename")}>
            <AntInput
              placeholder={t("profile.middlename")}
              value={formData.middlename}
              onChange={(e) => {
                handleInputChange('middlename', e.target.value);
                register('middlename').onChange(e);
              }}
              className='w-80'
              status={errors.middlename ? 'error' : ''}
            />
            {errors.middlename && <span className="error-message">{errors.middlename.message}</span>}
          </Form.Item>
          <Form.Item label={t("profile.surname")}>
            <AntInput
              placeholder={t("profile.surname")}
              value={formData.surname}
              onChange={(e) => {
                handleInputChange('surname', e.target.value);
                register('surname').onChange(e);
              }}
              className='w-80'
              status={errors.surname ? 'error' : ''}
            />
            {errors.surname && <span className="error-message">{errors.surname.message}</span>}
          </Form.Item>
          <Form.Item label={t("profile.telephone")}>
            <AntInput
              placeholder={t("profile.telephone")}
              value={formData.phone}
              onChange={(e) => {
                handleInputChange('phone', e.target.value);
                register('phone').onChange(e);
              }}
              className='w-80'
              status={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone.message}</span>}
          </Form.Item>
          <Form.Item label="E-mail *">
            <AntInput
              type="email"
              placeholder="E-mail *"
              value={formData.email}
              onChange={(e) => {
                handleInputChange('email', e.target.value);
                register('email').onChange(e);
              }}
              disabled={true}
              className='w-80'
              status={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </Form.Item>
          <div className='flex'>
            <input type='checkbox' />
            <div className='ml-2 text-text02 text-base'>{t("profile.agree")}</div>
          </div>
          <div>
            <div className='text-text02'>{t("routes.lan")}</div>
            <LanguageSelector />
          </div>
          <div className="flex">
            <Button form={false} title={t("profile.logout")} classname='mt-2' handleClick={logout} />
          </div>
        </div>
        <div className="flex flex-col items-center md:ml-auto lg:ml-40 w-full md:w-1/3">
          <div>{t("profile.photo")}</div>

          {imagePreview ? (
            <div className="relative w-36 h-36 rounded-full bg-[#bffa00] flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
              />
            </div>
          ) : (
            <Avatar type="profile" userName={userName} />
          )}

          <div className="mt-2">
            <label htmlFor="file-upload" className="w-36 flex justify-center items-center text-primary02 cursor-pointer">
              {t("profile.changePh")}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex">
            <Button form={true} title={t("profile.save")} classname='mt-10' isLoading={isMutating} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default InfoTab;