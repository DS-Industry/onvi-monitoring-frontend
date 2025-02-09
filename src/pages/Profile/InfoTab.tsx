import React, { useState, useEffect, useMemo } from 'react';
import Input from '@ui/Input/Input';
import Button from '@ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import { useClearUserData, useUser } from '@/hooks/useUserStore';
import { updateUserProfile } from '@/services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser } from '@/hooks/useUserStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useClearJwtToken, useClearPermissions, useSetPermissions } from '@/hooks/useAuthStore';


const InfoTab: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const initials = 'CE'; // Replace this with dynamic initials logic
  const user = useUser();
  const setUser = useSetUser();
  const setClearUser = useClearUserData();
  const setClearToken = useClearJwtToken();
  const setClearPermissions = useClearPermissions();
  const setPermissions = useSetPermissions();
  const navigate = useNavigate();

  const defaultValues = useMemo(
    () => ({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      middlename: user.middlename || '',
      surname: user.surname || '',
      imagePreview: user.avatar ? "https://storage.yandexcloud.net/onvi-business/avatar/user/" + user.avatar : null
    }),
    [user]
  );

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  // const { trigger } = useSWRMutation(
  //   `user/avatar`,
  //   async () => {
  //     if (selectedFile) {
  //       const formData = new FormData();
  //       formData.append('file', selectedFile);
  //       formData.append('id', user.id.toString())
  //       return await uploadUserAvatar(formData);
  //     }
  //   });

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
      // const uploadAvatar = selectedFile ? trigger() : Promise.resolve(null);
      const updateUserData = updateUser();

      if ((await updateUserData).props.avatar) {
        const avatarUrl = "https://storage.yandexcloud.net/onvi-business/avatar/user/" + `${(await updateUserData).props.avatar}` || null;
        setImagePreview(avatarUrl);
        localStorage.setItem('avatarUrl', avatarUrl || ""); // Store the avatar URL in localStorage for persistence
      }

      const [updatedData] = await Promise.all([updateUserData]);

      // if (avatarResult) {
      //   const avatarUrl = avatarResult; 
      //   setImagePreview(avatarUrl);
      //   localStorage.setItem('avatarUrl', avatarUrl);
      //   console.log('Uploaded file:', selectedFile);
      // }

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
    
    setClearUser();
    setClearToken();
    setClearPermissions();
    setPermissions([]);
    navigate('/login');
  }

  console.log("Image Preview: ", imagePreview);

  return (
    <div className="max-w-6xl mr-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex flex-col space-y-6 w-full md:w-2/3">
            <div>
              <Input
                type="text"
                title={t("profile.name")}
                label={t("profile.name")}
                value={formData?.name}
                changeValue={(e) => handleInputChange('name', e.target.value)}
                {...register('name', { required: 'Имя is required' })}
                disabled={false}
                inputType="primary"
                classname='w-80'
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </div>
            <div>
              <Input
                type="text"
                title={t("profile.middlename")}
                label={t("profile.middlename")}
                value={formData.middlename}
                changeValue={(e) => handleInputChange('middlename', e.target.value)}
                {...register('middlename')}
                disabled={false}
                inputType="primary"
                classname='w-80'
                error={!!errors.middlename}
                helperText={errors.middlename?.message}
              />
            </div>
            <div>
              <Input
                type="text"
                title={t("profile.surname")}
                label={t("profile.surname")}
                value={formData.surname}
                changeValue={(e) => handleInputChange('surname', e.target.value)}
                {...register('surname', { required: 'Отчество is required' })}
                disabled={false}
                inputType="primary"
                classname='w-80'
                error={!!errors.surname}
                helperText={errors.surname?.message}
              />
            </div>
            <div>
              <Input
                type="text"
                label={t("profile.telephone")}
                title={t("profile.telephone")}
                value={formData.phone}
                changeValue={(e) => handleInputChange('phone', e.target.value)}
                {...register('phone')}
                disabled={false}
                inputType="primary"
                classname='w-80'
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </div>
            <div className='flex'>
              <div>
                <Input
                  type="email"
                  title="E-mail *"
                  value={formData.email}
                  changeValue={(e) => handleInputChange('email', e.target.value)}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  disabled={true}
                  inputType="primary"
                  classname='w-80'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </div>
              {/* <div className='flex ml-2 mt-5 text-primary02 font-semibold text-base items-center justify-center'>{t("profile.email")}</div> */}
            </div>
            <div className='flex'>
              <input type='checkbox' />
              <div className='ml-2 text-text02 text-base'>{t("profile.agree")}</div>
            </div>
            <div className="flex">
              <Button form={false} title={t("profile.logout")} classname='mt-2' handleClick={logout} />
            </div>
          </div>
          <div className="flex flex-col items-center md:ml-auto lg:ml-40 w-full md:w-1/3">
            <div>{t("profile.photo")}</div>
            <div className="relative w-36 h-36 rounded-full bg-[#bffa00] flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-black">{initials}</span>
              )}
            </div>
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
