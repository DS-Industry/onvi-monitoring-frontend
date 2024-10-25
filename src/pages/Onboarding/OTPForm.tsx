import Button from "@/components/ui/Button/Button";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { registerActivationUser } from "@/services/api/platform";
import { useSetUser, useClearUserData } from '@/hooks/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useSetTokens } from '@/hooks/useAuthStore';

type Props = {
    registerObj: { email: string };
}

const OTPForm: React.FC<Props> = ({ registerObj }: Props) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [otpString, setOtpString] = useState("");
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const setUser = useSetUser();
    const clearData = useClearUserData();
    const setTokens = useSetTokens();

    const defaultValues = {
        confirmString: ''
    }

    const [formData, setFormData] = useState(defaultValues);

    const { handleSubmit, setValue } = useFormHook(formData);

    const { trigger, isMutating } = useSWRMutation(
        'user/auth/activation',
        async () => registerActivationUser({
            email: registerObj.email,
            confirmString: `${otpString.substring(0, 3)}-${otpString.substring(3)}`
        })
    );

    const handleChange = (value: string, index: number) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            console.log(newOtp);
            console.log(registerObj.email);
            if (index == 5) {
                const newOtpString = newOtp.join("");
                console.log(newOtpString);
                setOtpString(newOtpString);
                setValue("confirmString", newOtpString);
                setFormData((prev) => ({ ...prev, ["confirmString"]: value }));
            }
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`)?.focus();
            }
        }
    };

    const handleBackspace = (index: number) => {
        if (index > 0 && otp[index] === "") {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const onSubmit = async (data: unknown) => {
        console.log(data);
        try {
            const result = await trigger();
            if (result && result.user && result.tokens) {
                console.log(result);
                const { user, tokens } = result;
                setUser({ user: user?.props });
                setTokens({ tokens });
                navigate('/');
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
            console.log("Register error:", error);
            clearData();
        }
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1 mt-16">{t('Введите код')}</p>
            <p className="font-normal text-text01 text-base">Мы отправили его на E-mail</p>
            <p className="font-normal text-text01 text-base">{registerObj.email}</p>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex justify-center space-x-4 mt-10">
                    {otp.map((value, index) => (
                        <React.Fragment key={index}>
                            <input
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => e.key === 'Backspace' && handleBackspace(index)}
                                className={`w-8 h-12 text-center bg-background02 text-text01 border ${isError ? 'border-errorFill' : 'border-[#E4E5E7]'} rounded-lg text-2xl focus:outline-none`}
                            />
                            {/* Render the dash after the third input */}
                            {index === 2 && <span className="text-2xl text-[#e4e5e7] font-semibold self-center">-</span>}
                        </React.Fragment>
                    ))}
                </div>
                {isError && (
                    <p className="text-errorFill text-center mt-2">Вы ввели неверный код</p>
                )}

                <Button type="basic" title={t('Зарегистрироваться')} form={true} classname='w-full' isLoading={isMutating} />
            </form>
        </div>
    );
}

export default OTPForm;
