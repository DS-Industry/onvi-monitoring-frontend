import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const ForgotPasswordForm: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mt-20 mb-1">Восстановление пароля</p>
            <p className="font-normal text-text01 text-base mb-5">Пожалуйста, придумайте новый пароль, который будете знать только вы.</p>
            <form>
                <Input
                    type="password"
                    title='Пароль'
                    classname="mb-5"
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
                <Input
                    type="password"
                    title='Подтвердите пароль'
                    classname="mb-5"
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
                <div className="flex items-center justify-between mb-10">
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="rounded text-primary02 border-gray-300 focus:ring-indigo-500" />
                        <span className="ml-2 text-sm text-text02">{t('Запомнить меня')}</span>
                    </label>
                </div>
                <Button type="basic" title={t('Войти')} form={true} classname='w-full' />
            </form>
        </div>
    )
}

export default ForgotPasswordForm;