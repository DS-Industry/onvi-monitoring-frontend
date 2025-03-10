import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import useFormHook from "@/hooks/useFormHook";
import { useClearUserData, useSetUser } from "@/hooks/useUserStore";
import { createUserRole, getWorkerStatus } from "@/services/api/platform";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import OTPImage from '@/assets/OTPImage.png';
import OnviBlue from '@/assets/onvi_blue.png';
import useSWR from "swr";
import NoDataUI from "@/components/ui/NoDataUI";
import NoToken from "@/assets/NoToken.png";

const InviteUser: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setUser = useSetUser();
    const [searchParams] = useSearchParams();
    const [isError, setIsError] = useState(false);
    const clearData = useClearUserData();
    const defaultValues = {
        password: '',
        confirmPassword: ''
    }

    const key = searchParams.get("key") || "";

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    type FieldType = "password" | "confirmPassword";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const { data: validUser } = useSWR(
        [`valid-user`],
        async () => {
            try {
                return await getWorkerStatus(key);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    return null; 
                }
                throw error; 
            }
        },
        { 
            revalidateOnFocus: false, 
            revalidateOnReconnect: false, 
            keepPreviousData: true,
            shouldRetryOnError: (error) => error.response?.status !== 404, // Do not retry on 404
        }
    );
    
    const { trigger, isMutating } = useSWRMutation(['create-worker'], async () => createUserRole({
        password: formData.password
    }, key));

    const onSubmit = async (data: unknown) => {
        console.log(data);
        try {
            const result = await trigger();
            if (result && result.user) {
                console.log(result);
                const { user } = result;
                setUser({ user: user?.props });
                navigate('/login');
            } else {
                throw new Error(t('Password change failed. Please try again.'));
            }
        } catch (error) {
            console.log("Register error:", error);
            clearData();
        }
    };

    useEffect(() => {
        if (validUser?.status != "SUCCESS") {
            setIsError(true);
        }
    }, [validUser]);

    return (
        <div>
            {isError ? (
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("organizations.user")}
                        description={""}
                    >
                        <img src={NoToken} className="mx-auto" />
                    </NoDataUI>
                </div>
            ) : (<div className="flex min-h-screen items-center justify-center bg-background02 p-4">
                <div className="flex flex-col rounded-lg p-8 lg:flex-row md:p-0">
                    <div className="lg:w-5/12 p-8 lg:ml-40">
                        <div className='flex mb-5'>
                            <img src={OnviBlue} className='h-7 w-14' />
                            <div className="text-primary02 font-semibold text-xs items-center justify-center flex ml-2">{t("login.business")}</div>
                        </div>
                        <p className="text-3xl font-extrabold leading-[1.25] text-text01 mt-20 mb-1">{t("forgot.set")}</p>
                        <p className="font-normal text-text01 text-base mb-5">{t("forgot.please")}</p>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                type="password"
                                title={t("login.password")}
                                value={formData.password}
                                changeValue={(e) => handleInputChange('password', e.target.value)}
                                error={!!errors.password}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                })}
                                helperText={errors.password?.message || ''}
                            />
                            <Input
                                type="password"
                                title={t("profile.confirm")}
                                value={formData.confirmPassword}
                                changeValue={(e) => handleInputChange('confirmPassword', e.target.value)}
                                error={!!errors.confirmPassword}
                                {...register('confirmPassword', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    validate: (value) =>
                                        value === formData.password || 'Passwords do not match'
                                })}
                                helperText={errors.confirmPassword?.message || ''}
                            />
                            <div className="flex items-center justify-between mb-10">
                                <label className="inline-flex items-center">
                                    <input type="checkbox" className="rounded text-primary02 border-text02" />
                                    <span className="ml-2 text-sm text-text02">{t('login.remember')}</span>
                                </label>
                            </div>
                            <Button type="basic" title={t('forgot.set')} form={true} classname='w-full' isLoading={isMutating} />
                        </form>
                    </div>

                    <div className="hidden lg:flex lg:w-8/12 rounded-r-lg items-center justify-center lg:ml-20">
                        <div className="p-8">
                            <img src={OTPImage} alt="Rocket illustration" key={"forgot-password"} className="object-cover w-11/12 h-11/12" />
                        </div>
                    </div>
                </div>
            </div>)}
        </div>
    )
}

export default InviteUser;