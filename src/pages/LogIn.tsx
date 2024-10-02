import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../style/LogIn.css'
import { loginPlatformUser } from '../services/api/platform';
import useSWRMutation from 'swr/mutation';
import { useSetUser, useClearUserData } from '../hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useSetTokens } from '../hooks/useAuthStore';
import Button from '@ui/Button/Button';
import Input from '@ui/Input/Input';
// import SearchInput from '@ui/Input/SearchInput';
// import DropdownInput from '@ui/Input/DropdownInput';
// import MultilineInput from '@ui/Input/MultilineInput';
import useAuthStore from '@/config/store/authSlice';
import useFormHook from '@/hooks/useFormHook';

const LogIn: React.FC = () => {
  const { t } = useTranslation();

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorEmailMessage, setErrorEmailMessage] = useState('');
  const [errorPasswordMessage, setErrorPasswordMessage] = useState('');
  // const [searchValue, setSearchValue] = useState<string>('');
  // const [selectedValue, setSelectedValue] = useState('');
  // const [textValue, setTextValue] = useState<string>('');
  const defaultValues = {
    loginEmail: '',
    loginPassword: ''
  };

  const [formData, setFormData] = useState(defaultValues);

  // const options = [
  //   { label: 'Option 1', value: 'option1' },
  //   { label: 'Option 2', value: 'option2' },
  //   { label: 'Option 3', value: 'option3' },
  //   { label: 'Option 4', value: 'option4' },
  // ];

  const userPermissions = [
    { object: "Pos", action: "create" },
    { object: "Pos", action: "update" },
    { object: "Finance", action: "view" },
  ];

  // const handleSearchChange = (value: string) => {
  //   setSearchValue(value);
  // };

  // const handleClearSearch = () => {
  //   setSearchValue('');
  // };

  const { trigger, isMutating } = useSWRMutation(
    'user/auth/login',
    async () => loginPlatformUser({ email: formData.loginEmail, password: formData.loginPassword }) // Fetcher function
  );

  const setUser = useSetUser();
  const clearData = useClearUserData();
  const setTokens = useSetTokens();
  const navigate = useNavigate();

  const { register, handleSubmit, errors, setValue } = useFormHook(formData);

  type FieldName = 'loginEmail' | 'loginPassword';

  // Handle input change
  const handleInputChange = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValue(field, value); // Update react-hook-form's internal value
  };

  const onSubmit = async (data: any) => {

    // Simple validation
    if (!data.loginEmail) setEmailError(true);
    if (!data.loginPassword) setPasswordError(true);
    try {
      // Manually trigger the mutation function to call the API
      const result = await trigger();

      if (result && result.admin && result.tokens) {
        const { admin, tokens } = result;
        setUser({ user: admin?.props });
        setTokens({ tokens });
        useAuthStore.getState().setPermissions(userPermissions);
        navigate('/');
      } else {
        throw new Error(t('Invalid email or password. Please try again.'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setEmailError(true);
      setPasswordError(true);
      setErrorEmailMessage(t('Please enter correct Email Id.'));
      setErrorPasswordMessage(t('Please enter correct Password.'));
      clearData();
    }
  };
  return (
    <div className="login-form-container">
      <h1>{t('Onvi Monitoring')}</h1>
      <p>{t('Fill the form to login')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <div className="form-group">
          <label htmlFor="email">{t('Email')}</label>
          <Input
            type="text"
            value={formData.loginEmail}
            changeValue={(e) => handleInputChange('loginEmail', e.target.value)}
            error={!!errors.loginEmail || !!emailError}
            {...register('loginEmail', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            })}
            label="Enter your email"
            helperText={errors.loginEmail?.message || errorEmailMessage || ''}
            inputType="primary"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('Password')}</label>
          <Input
            type="password"
            value={formData.loginPassword}
            changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
            error={!!errors.loginPassword || !!passwordError}
            {...register('loginPassword', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            label="Enter your password"
            helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
            inputType="primary"
          />
        </div>
        {/* <SearchInput
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          searchType="underline"
          isDisabled={false}
          error={false}
          errorText=""
        />
        <DropdownInput
          label="Select an option..."
          value={selectedValue}
          onChange={setSelectedValue}
          options={options}
          isDisabled={false}
          isLoading={false}
          isMultiSelect={false}
          isEmptyState={false}
          showMoreButton={true}
          isSelectable={true}
        />
        <MultilineInput
          value={textValue}
          changeValue={(e) => setTextValue(e.target.value)}
          label="Comments"
          error={false}
          disabled={false}
          rows={4}
          inputType='primary'
        /> */}

        <Button type="outline" title='Login' form={true} isLoading={isMutating} />
      </form>
    </div>
  );
};

export default LogIn;
