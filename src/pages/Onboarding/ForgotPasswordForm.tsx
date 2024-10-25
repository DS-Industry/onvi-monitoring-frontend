import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import useFormHook from "@/hooks/useFormHook";
import { useClearUserData, useSetUser } from "@/hooks/useUserStore";
import { passwordResetUser } from "@/services/api/platform";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";

type Props = {
    forgotObj: { email: string, confirmString: string };
}

const ForgotPasswordForm: React.FC<Props> = ({ forgotObj }: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setUser = useSetUser();
    const clearData = useClearUserData();
    const defaultValues = {
        password: '',
        confirmPassword: ''
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    type FieldType = "password" | "confirmPassword";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const { trigger, isMutating } = useSWRMutation(
        'user/auth/password/reset',
        async () => passwordResetUser({
            email: forgotObj.email,
            confirmString: forgotObj.confirmString,
            newPassword: formData.password
        })
    );
    
    const onSubmit = async (data: unknown) => {
        console.log(data);
        try {
            const result = await trigger();
            if (result && result.correctUser) {
                console.log(result);
                const { correctUser } = result;
                setUser({ user: correctUser?.props });
                navigate('/login');
            } else {
                throw new Error(t('Password change failed. Please try again.'));
            }
        } catch (error) {
            console.log("Register error:", error);
            clearData();
        }
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mt-20 mb-1">Восстановление пароля</p>
            <p className="font-normal text-text01 text-base mb-5">Пожалуйста, придумайте новый пароль, который будете знать только вы.</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="password"
                    title='Пароль'
                    classname="mb-5"
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
                    title='Подтвердите пароль'
                    classname="mb-5"
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
                        <input type="checkbox" className="rounded text-primary02 border-gray-300 focus:ring-indigo-500" />
                        <span className="ml-2 text-sm text-text02">{t('Запомнить меня')}</span>
                    </label>
                </div>
                <Button type="basic" title={t('Войти')} form={true} classname='w-full' isLoading={isMutating} />
            </form>
        </div>
    )
}

export default ForgotPasswordForm;