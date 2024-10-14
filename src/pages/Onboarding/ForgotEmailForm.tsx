import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const ForgotEmailForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mt-20 mb-1">Восстановление пароля</p>
            <p className="font-normal text-text01 text-base mb-5">Введите ваш Email, зарегистрированный на сайте, и мы вышлем код для восстановления пароля</p>
            <form>
                    <Input
                        type="text"
                        title='Email'
                        classname="mb-10"
                    // value={formData.loginEmail}
                    // changeValue={(e) => handleInputChange('loginEmail', e.target.value)}
                    // error={!!errors.loginEmail || !!emailError}
                    // {...register('loginEmail', {
                    //   required: 'Email is required',
                    //   pattern: {
                    //     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    //     message: 'Invalid email format'
                    //   }
                    // })}
                    // helperText={errors.loginEmail?.message || errorEmailMessage || ''}
                    />
                <Button type="basic" title={t('Далее')} form={true} classname='w-full' />
            </form>
        </div>
    )
}

export default ForgotEmailForm;