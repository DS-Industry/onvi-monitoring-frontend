import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import { passwordValidUser } from "@/services/api/platform";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import useSWRMutation from "swr/mutation";

type Props = {
    count: number;
    setCount: (key: number) => void;
    forgotObj: { email: string, confirmString: string };
    setForgotObj: (obj: { email: string, confirmString: string }) => void;
}

const ForgotOTPForm: React.FC<Props> = ({ count, setCount, forgotObj, setForgotObj }: Props) => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [otpString, setOtpString] = useState("");
    const [isError, setIsError] = useState(false);

    const defaultValues = {
        confirmString: ''
    }

    const [formData, setFormData] = useState(defaultValues);

    const { handleSubmit, setValue } = useFormHook(formData);


    const handleChange = (value: string, index: number) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            console.log(newOtp);
            console.log(forgotObj.email);
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

    const { trigger, isMutating } = useSWRMutation(
        'user/auth/password/valid/confirm',
        async () => passwordValidUser({
            email: forgotObj.email,
            confirmString: `${otpString.substring(0,3)}-${otpString.substring(3)}`
        })
    );

    const onSubmit = async (data: unknown) => {
        console.log(data);
        try {
            const result = await trigger();
            if (result) {
                console.log(result);
                setForgotObj({ email: forgotObj.email, confirmString: `${otpString.substring(0,3)}-${otpString.substring(3)}`});
                console.log(forgotObj);
                setCount(count + 1);
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
            console.log("Forgot Password error:", error);
        }
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1 mt-16">{t('Введите код')}</p>
            <p className="font-normal text-text01 text-base">Мы отправили его на E-mail</p>
            <p className="font-normal text-text01 text-base mb-5">{forgotObj.email}</p>
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
                
                <Button type="basic" title={t('Далее')} form={true} classname='w-full' isLoading={isMutating} />
                {isError && (
                    <p className="text-primary02 text-center mt-2">Отправить код подтверждения  еще раз</p>
                )}
            </form>
        </div>
    )
}

export default ForgotOTPForm;