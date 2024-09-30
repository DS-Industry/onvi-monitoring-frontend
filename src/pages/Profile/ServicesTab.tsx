import React, { useState, useMemo, useEffect } from 'react';
import Input from '@ui/Input/Input';
import DropdownInput from '@ui/Input/DropdownInput';
import MultilineInput from '@ui/Input/MultilineInput';
import Button from '@ui/Button/Button';
import useFormHook from '../../hooks/useFormHook'; // Import the custom hook
import { useUser } from '../../hooks/useUserStore';

export const ServicesTab: React.FC = () => {

  const user = useUser();
  // Options for dropdown input
  const options = [
    { label: 'Не выбран', value: 'Не выбран' },
    { label: 'Мужской', value: 'Мужской' },
    { label: 'Женский', value: 'Женский' },
  ];

  // Memoize default values
  const defaultValues = useMemo(
    () => ({
      lastName: user.surname,
      firstName: user.name,
      middleName: '',
      employmentDate: '',
      phone: user.phone,
      email: user.email,
      citizenship: '',
      gender: user.gender,
      passportData: '',
      inn: '',
      insuranceNumber: '',
    }),
    []
  );

  // Use custom form hook
  const { register, handleSubmit, errors, setValue, reset } = useFormHook(defaultValues);


  const [formData, setFormData] = useState(defaultValues);

  // Set the initial form values and avatar preview
  useEffect(() => {
    reset(defaultValues); // Reset the form with default values
    setFormData(defaultValues); // Initialize local state
  }, [reset, defaultValues]);

  // Handle input change for controlled inputs
  const handleInputChange = (field: keyof typeof defaultValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); // Update the internal state of react-hook-form
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log('Form data:', data);
    // Handle form submission logic here
  };

  return (
    <form className="space-y-6 w-2/3" onSubmit={handleSubmit(onSubmit)}>
      {/* Last Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Фамилия</label>
        <Input
          type={'text'}
          value={formData.lastName}
          label='Введите фамилию'
          changeValue={(e) => handleInputChange('lastName', e.target.value)}
          {...register('lastName', { required: 'Фамилия is required' })}
          disabled={false}
          inputType={'primary'}
        />
        {errors.lastName && <span className="text-red-600">{errors.lastName.message}</span>}
      </div>

      {/* First Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Имя</label>
        <Input
          type={'text'}
          value={formData.firstName}
          label='Введите имя'
          changeValue={(e) => handleInputChange('firstName', e.target.value)}
          {...register('firstName', { required: 'Имя is required' })}
          disabled={false}
          inputType={'primary'}
        />
        {errors.firstName && <span className="text-red-600">{errors.firstName.message}</span>}
      </div>

      {/* Middle Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Отчество</label>
        <Input
          type={'text'}
          value={formData.middleName}
          label='Введите отчество'
          changeValue={(e) => handleInputChange('middleName', e.target.value)}
          {...register('middleName')}
          disabled={false}
          inputType={'primary'}
        />
      </div>

      {/* Employment Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Дата приема на работу</label>
        <Input
          type={'date'}
          value={formData.employmentDate}
          changeValue={(e) => handleInputChange('employmentDate', e.target.value)}
          {...register('employmentDate', { required: 'Дата приема на работу is required' })}
          disabled={false}
          inputType={'primary'}
        />
        {errors.employmentDate && <span className="text-red-600">{errors.employmentDate.message}</span>}
      </div>

      {/* Phone Number Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Телефон</label>
        <Input
          type='tel'
          label='+7 (000) 000-00-00'
          value={formData.phone}
          changeValue={(e) => handleInputChange('phone', e.target.value)}
          {...register('phone', { required: 'Телефон is required' })}
          disabled={false}
          inputType={'primary'}
        />
        {errors.phone && <span className="text-red-600">{errors.phone.message}</span>}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">E-mail</label>
        <Input
          type='email'
          label='Введите email'
          value={formData.email}
          changeValue={(e) => handleInputChange('email', e.target.value)}
          {...register('email', { required: 'E-mail is required' })}
          disabled={false}
          inputType={'primary'}
        />
        {errors.email && <span className="text-red-600">{errors.email.message}</span>}
      </div>

      {/* Citizenship Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Гражданство</label>
        <Input
          type='text'
          label='Введите гражданство сотрудника'
          value={formData.citizenship}
          changeValue={(e) => handleInputChange('citizenship', e.target.value)}
          {...register('citizenship')}
          disabled={false}
          inputType={'primary'}
        />
      </div>

      {/* Gender Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Пол</label>
        <DropdownInput
          label="Select an option..."
          value={formData.gender}
          onChange={(value) => handleInputChange('gender', value)}
          options={options}
          isDisabled={false}
          isLoading={false}
          isMultiSelect={false}
          isEmptyState={false}
          showMoreButton={true}
          isSelectable={true}
        />
      </div>

      {/* Passport Data Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Паспортные данные</label>
        <MultilineInput
          label='Введите паспортные данные сотрудника'
          value={formData.passportData}
          changeValue={(e) => handleInputChange('passportData', e.target.value)}
          rows={3}
          {...register('passportData')}
        />
      </div>

      {/* INN Number Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">ИНН</label>
        <Input
          type='text'
          value={formData.inn}
          label='Введите ИНН сотрудника'
          changeValue={(e) => handleInputChange('inn', e.target.value)}
          {...register('inn')}
          disabled={false}
          inputType={'primary'}
        />
      </div>

      {/* Insurance Number Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Номер страхового свидетельства</label>
        <Input
          type='text'
          value={formData.insuranceNumber}
          label='Введите номер страхового свидетельства'
          changeValue={(e) => handleInputChange('insuranceNumber', e.target.value)}
          {...register('insuranceNumber')}
          disabled={false}
          inputType={'primary'}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button form={true} title="Сохранить" />
      </div>
    </form>
  );
};
