import Button from "@/components/ui/Button/Button";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const ForgotOTPForm: React.FC = () => {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [isError, setIsError] = useState(false);

    const handleChange = (value: string, index: number) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Replace this with your validation logic
        const isOtpValid = otp.join('') === '123456'; // Example of correct OTP
        if (!isOtpValid) {
            setIsError(true);
        } else {
            setIsError(false);
            // Proceed with submission or navigation
        }
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1 mt-16">{t('Введите код')}</p>
            <p className="font-normal text-text01 text-base">Мы отправили его на E-mail</p>
            <p className="font-normal text-text01 text-base mb-5">mail@gmail.com</p>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="flex space-x-2 justify-center mt-10">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => e.key === 'Backspace' && handleBackspace(index)}
                            className={`w-10 h-10 text-center border ${isError ? 'border-red-500' : 'border-gray-300'} rounded-md text-lg`}
                        />
                    ))}
                </div>
                {isError && (
                    <p className="text-errorFill text-center mt-2">Вы ввели неверный код</p>
                )}
                
                <Button type="basic" title={t('Далее')} form={true} classname='w-full' />
                {isError && (
                    <p className="text-primary02 text-center mt-2">Отправить код подтверждения  еще раз</p>
                )}
            </form>
        </div>
    )
}

export default ForgotOTPForm;