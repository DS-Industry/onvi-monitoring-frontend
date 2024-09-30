import React, { useState, useEffect, useMemo } from 'react';
import Input from '@ui/Input/Input';
import MultilineInput from '@ui/Input/MultilineInput';
import DropdownInput from '@ui/Input/DropdownInput';
import Button from '@ui/Button/Button';
import useFormHook from '../../hooks/useFormHook';
import { useUser } from '../../hooks/useUserStore';
import useSWR from 'swr';
import { uploadUserAvatar } from '../../services/api/platform';

const InfoTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const initials = 'CE'; // Replace this with dynamic initials logic
  const user = useUser();

  // Memoize default values to avoid unnecessary recalculations
  const defaultValues = useMemo(
    () => ({
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: 'Описание сотрудника',
      position: 'Мойщик',
    }),
    []
  );

  // Destructure form methods from useFormHook
  const { register, handleSubmit, errors, reset, setValue } = useFormHook();

  // Initialize controlled values for each input
  const [formData, setFormData] = useState(defaultValues);

  // Options for DropdownInput
  const options = [
    { label: 'Мойщик', value: 'Мойщик', name: 'Мойщик' },
    { label: 'Другая должность', value: 'Другая должность', name: 'Другая должность' }
  ];

  const { mutate } = useSWR(
    selectedFile ? [`user/avatar`] : null,
    async () => {
      // Create FormData only when a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('id', user.id.toString())
        // Call the upload API with FormData
        return await uploadUserAvatar( formData );
      }
    },
    { 
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );
  


  // Set the initial form values and avatar preview
  useEffect(() => {
    const storedAvatarUrl = localStorage.getItem('avatarUrl'); // Get the URL from local storage
    if (storedAvatarUrl) {
      setImagePreview(storedAvatarUrl); // Set as image preview if available
    }
      reset(defaultValues); // Reset the form with default values
      setFormData(defaultValues); // Initialize local state
  }, [reset, defaultValues]);

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
  type FieldName = 'name' | 'email' | 'phone' | 'position' | 'bio' | 'file';

  // Handle input change
  const handleInputChange = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); // Update react-hook-form's internal value
  };

  const handleDropdownChange = (value: string) => {
    handleInputChange('position', value); // Update local state
    setValue('position', value); // Update react-hook-form's internal value
  };
  

  // Form submission handler
  const onSubmit = async (data: any) => {
    console.log('Form Data:', data);
    const result = await mutate();
    if (selectedFile && result) {
      const avatarUrl = result; // Assuming result contains the URL
      setImagePreview(avatarUrl);
      localStorage.setItem('avatarUrl', avatarUrl); // Save the URL in local storage
      console.log('Uploaded file:', selectedFile);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Основная информация</h1>

      {/* Main form container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-10 items-start">
          {/* Form fields */}
          <div className="space-y-6 w-2/3">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">ФИО</label>
              <Input
                type="text"
                label="ФИО"
                value={formData.name}
                changeValue={(e) => handleInputChange('name', e.target.value)}
                {...register('name', { required: 'ФИО is required' })}
                disabled={false}
                inputType="primary"
              />
              {errors.name && <span className="text-red-600">{errors.name.message}</span>}
            </div>

            {/* Position */}
            <div>
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
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Телефон</label>
              <Input
                type="text"
                label="Телефон"
                value={formData.phone}
                changeValue={(e) => handleInputChange('phone', e.target.value)}
                {...register('phone', { required: 'Телефон is required' })}
                disabled={false}
                inputType="primary"
              />
              {errors.phone && <span className="text-red-600">{errors.phone.message}</span>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <Input
                type="email"
                label="E-mail"
                value={formData.email}
                changeValue={(e) => handleInputChange('email', e.target.value)}
                {...register('email', { required: 'E-mail is required' })}
                disabled={false}
                inputType="primary"
              />
              {errors.email && <span className="text-red-600">{errors.email.message}</span>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <MultilineInput
                label="О сотруднике"
                value={formData.bio}
                changeValue={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                {...register('bio')}
              />
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col w-1/3">
            <div>Фото</div>
            <div className="relative w-36 h-36 rounded-full bg-lime-300 flex items-center justify-center">
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
            <div className="mt-2 text-center">
              <label htmlFor="file-upload" className="items-center text-blue-600 cursor-pointer">
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
        <div className="flex justify-end mt-6">
          <Button form={true} title="Сохранить" />
        </div>
      </form>
    </div>
  );
};

export default InfoTab;
