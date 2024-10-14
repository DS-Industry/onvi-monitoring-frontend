import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { loginPlatformUser } from '../../services/api/platform';
// import useSWRMutation from 'swr/mutation';
// import { useSetUser, useClearUserData } from '../../hooks/useUserStore';
// import { useNavigate } from 'react-router-dom';
// import SearchInput from '@ui/Input/SearchInput';
// import DropdownInput from '@ui/Input/DropdownInput';
// import MultilineInput from '@ui/Input/MultilineInput';
// import useAuthStore from '@/config/store/authSlice';
// import useFormHook from '@/hooks/useFormHook';
import { ArrowLeft } from 'feather-icons-react';
import OTPImage from '@/assets/OTPImage.svg';
import OnviBlue from '@/assets/onvi_blue.png';
import ForgotEmailForm from './ForgotEmailForm';
import ForgotOTPForm from './ForgotOTPForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();

    const [count, setCount] = useState(2);

    // const [searchValue, setSearchValue] = useState<string>('');
    // const [selectedValue, setSelectedValue] = useState('');
    // const [textValue, setTextValue] = useState<string>('');
    //   const defaultValues = {
    //     loginEmail: '',
    //     loginPassword: ''
    //   };

    //   const [formData, setFormData] = useState(defaultValues);

    // const options = [
    //   { name: 'Option 1', value: 'option1' },
    //   { name: 'Option 2', value: 'option2' },
    //   { name: 'Option 3', value: 'option3' },
    //   { name: 'Option 4', value: 'option4' },
    // ];

    //   const userPermissions = [
    //     { object: "Pos", action: "create" },
    //     { object: "Pos", action: "update" },
    //     { object: "Finance", action: "view" },
    //   ];

    // const handleSearchChange = (value: string) => {
    //   setSearchValue(value);
    // };

    // const handleClearSearch = () => {
    //   setSearchValue('');
    // };

    //   const { trigger, isMutating } = useSWRMutation(
    //     'user/auth/login',
    //     async () => loginPlatformUser({ email: formData.loginEmail, password: formData.loginPassword }) // Fetcher function
    //   );

    //   const setUser = useSetUser();
    //   const clearData = useClearUserData();
    //   const setTokens = useSetTokens();

    //   const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    //   type FieldName = 'loginEmail' | 'loginPassword';

    //   // Handle input change
    //   const handleInputChange = (field: FieldName, value: string) => {
    //     setFormData((prev) => ({ ...prev, [field]: value }));
    //     setValue(field, value); // Update react-hook-form's internal value
    //   };

    //   const onSubmit = async (data: any) => {

    //     // Simple validation
    //     if (!data.loginEmail) setEmailError(true);
    //     if (!data.loginPassword) setPasswordError(true);
    //     try {
    //       // Manually trigger the mutation function to call the API
    //       const result = await trigger();

    //       if (result && result.admin && result.tokens) {
    //         const { admin, tokens } = result;
    //         setUser({ user: admin?.props });
    //         setTokens({ tokens });
    //         useAuthStore.getState().setPermissions(userPermissions);
    //         navigate('/');
    //       } else {
    //         throw new Error(t('Invalid email or password. Please try again.'));
    //       }
    //     } catch (error) {
    //       console.error('Login error:', error);
    //       setEmailError(true);
    //       setPasswordError(true);
    //       setErrorEmailMessage(t('Please enter correct Email Id.'));
    //       setErrorPasswordMessage(t('Please enter correct Password.'));
    //       clearData();
    //     }
    //   };
    return (
        <div className="flex min-h-screen items-center justify-center bg-background02 p-4">
            <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
                <div className="lg:w-5/12 p-8 lg:ml-40">
                    <div className='flex text-primary02 mb-5'>
                        <ArrowLeft />
                        <p>Назад</p>
                    </div>
                    <div className='flex mb-5'>
                        <img src={OnviBlue} className='h-7 w-14' />
                        <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">БИЗНЕС</div>
                    </div>
                    { count === 0 && <ForgotEmailForm /> }
                    { count === 1 && <ForgotOTPForm /> }
                    { count === 2 && <ForgotPasswordForm /> }
                </div>

                <div className="hidden lg:flex lg:w-8/12 rounded-r-lg items-center justify-center lg:ml-20">
                    <div className="p-8">
                      <img src={OTPImage} alt="Rocket illustration" className="object-cover w-11/12 h-11/12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
