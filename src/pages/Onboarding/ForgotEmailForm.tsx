import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import useFormHook from "@/hooks/useFormHook";
import { forgotPasswordUser } from "@/services/api/platform";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import useSWRMutation from "swr/mutation";

type Props = {
    count: number;
    setCount: (key: number) => void;
    forgotObj: { email: string, confirmString: string };
    setForgotObj: (obj: { email: string, confirmString: string }) => void;
}

const ForgotEmailForm: React.FC<Props> = ({ count, setCount, forgotObj, setForgotObj }: Props) => {
    const { t } = useTranslation();
    const defaultValues = {
        email: ''
    }
    const [formData, setFormData] = useState(defaultValues);
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setErrorEmailMessage] = useState('');

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const handleInputChange = (value: string) => {
        setFormData((prev) => ({ ...prev, ["email"]: value }));
        setValue("email", value);
    };

    const { trigger, isMutating } = useSWRMutation(
        'user/auth/password/confirm',
        async () => forgotPasswordUser({
            email: formData.email
        }) 
      );

    const onSubmit = async () => {
        try {
            const result = await trigger();
            if(result) {
                setForgotObj({email: formData.email, confirmString: forgotObj.confirmString});
                setCount(count + 1);
            }
        } catch (error) {
            setEmailError(true);
            setErrorEmailMessage('Enter the correct email address.');
        }
    }

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mt-20 mb-1">{t("forgot.passwordRecovery")}</p>
            <p className="font-normal text-text01 text-base mb-5">{t("forgot.enter")}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    title='Email'
                    classname="mb-10"
                    value={formData.email}
                    changeValue={(e) => handleInputChange(e.target.value)}
                    error={!!errors.email || !!emailError}
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email format'
                        }
                    })}
                    helperText={errors.email?.message || emailErrorMessage || ''}
                />
                <Button type="basic" title={t('register.next')} form={true} classname='w-full' isLoading={isMutating} />
            </form>
        </div>
    )
}

export default ForgotEmailForm;