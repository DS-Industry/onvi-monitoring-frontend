import React, { useState, useEffect, useMemo } from 'react';
import Input from '@ui/Input/Input';
import MultilineInput from '@ui/Input/MultilineInput';
import DropdownInput from '@ui/Input/DropdownInput';
import Button from '@ui/Button/Button';
import useFormHook from '@/hooks/useFormHook';
import { useUser } from '@/hooks/useUserStore';
import { updateUserProfile, uploadUserAvatar } from '@/services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser } from '@/hooks/useUserStore';


const InfoTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const initials = 'CE'; // Replace this with dynamic initials logic
  const user = useUser();
  const setUser = useSetUser();

  // Memoize default values to avoid unnecessary recalculations
  const defaultValues = useMemo(
    () => ({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      middlename: user.middlename || '',
      surname: user.surname || ''
    }),
    [user]
  );

  // Initialize controlled values for each input
  const [formData, setFormData] = useState(defaultValues);


  // Destructure form methods from useFormHook
  const { register, handleSubmit, errors, reset, setValue } = useFormHook(formData);

  // Options for DropdownInput
  const options = [
    { value: 'Мойщик', name: 'Мойщик' },
    { value: 'Другая должность', name: 'Другая должность' }
  ];

  const { trigger } = useSWRMutation(
    `user/avatar`,
    async () => {
      // Create FormData only when a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('id', user.id.toString())
        // Call the upload API with FormData
        return await uploadUserAvatar(formData);
      }
    });

  const { trigger: updateUser, isMutating } = useSWRMutation('user', async () => updateUserProfile({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    middlename: formData.middlename,
    surname: formData.surname,
  }));


  // Set the initial form values and avatar preview
  useEffect(() => {
    const storedAvatarUrl = localStorage.getItem('avatarUrl'); // Get the URL from local storage
    if (storedAvatarUrl) {
      setImagePreview(storedAvatarUrl); // Set as image preview if available
    }
  }, []);

  // Handle file input change for profile image
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

  // Handle input change
  const handleInputChange = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); // Update react-hook-form's internal value
  };

  // const handleDropdownChange = (value: string) => {
  //   handleInputChange('position', value); // Update local state
  //   setValue('position', value); // Update react-hook-form's internal value
  // };


  // Form submission handler
  const onSubmit = async (data: any) => {
    console.log('Form Data:', data);
    try {
      const uploadAvatar = selectedFile ? trigger() : Promise.resolve(null);
      const updateUserData = updateUser();

      const [avatarResult, updatedData] = await Promise.all([uploadAvatar, updateUserData]);

      if (avatarResult) {
        const avatarUrl = avatarResult; // Assuming result contains the URL
        setImagePreview(avatarUrl);
        localStorage.setItem('avatarUrl', avatarUrl); // Save the URL in local storage
        console.log('Uploaded file:', selectedFile);
      }

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


  return (
    <div className="max-w-6xl mr-auto">
      {/* Main form container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* Form fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <Input
                type="text"
                title='Имя *'
                label="Имя *"
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
                title='Фамилия'
                label="Фамилия"
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
                title='Отчество'
                label="Отчество"
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
            {/* Position */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Должность</label>
              <DropdownInput
                label="Select an option..."
                value={formData.position}
                onChange={handleDropdownChange}
                options={options}
                isDisabled={false}
                isLoading={false}
                isMultiSelect={false}
                isEmptyState={false}
                showMoreButton={false}
                isSelectable={true}
              />
              {errors.position && <span className="text-red-600">{errors.position.message}</span>}
            </div> */}

            {/* Phone */}
            <div>
              <Input
                type="text"
                label="Телефон"
                title='Телефон'
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

            {/* Email */}
            <div className='flex'>
              <div>
                <Input
                  type="email"
                  title="E-mail *"
                  label="E-mail *"
                  value={formData.email}
                  changeValue={(e) => handleInputChange('email', e.target.value)}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  disabled={false}
                  inputType="primary"
                  classname='w-80'
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </div>
              <div className='flex ml-2 mt-5 text-primary02 font-semibold text-base items-center justify-center'>Изменить E-mail</div>
            </div>
            <div className='flex'>
              <input type='checkbox' />
              <div className='ml-2 text-text02 text-base'>Согласен на получение уведомлений по e-mail</div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col mt-10">
            <div>Фото</div>
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
                Сменить фото
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

        {/* Save Button */}
        <div className="flex">
          <Button form={true} title="Сохранить изменнния" classname='mt-10' isLoading={isMutating} />
        </div>
      </form>
    </div>
  );
};

export default InfoTab;
