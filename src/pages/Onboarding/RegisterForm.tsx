import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Calendar } from 'feather-icons-react';

const RegisterForm: React.FC = () => {
    const { t } = useTranslation();
    const [isToggled, setIsToggled] = useState(false);
    const [date, setDate] = useState<string>("");

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDate(event.target.value);
    };

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    const handleIconClick = () => {
        const dateInput = document.getElementById("date-input");
        if (dateInput) {
            dateInput.focus();
            // Workaround to trigger date picker on focus
            (dateInput as HTMLInputElement).showPicker?.();
        }
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-2">{t('Присоединяйтесь к Onvi-бизнес!')}</p>
            <form className="space-y-6">
                <div className="overflow-y-auto pr-6 h-96">
                    <div>
                        <Input
                            type="text"
                            title='Имя пользователя'
                            classname="mb-0"
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
                        <label className="text-xs text-text02 mb-5">Под этим именем вас будут знать другие пользователи Onvi-бизнес.</label>
                    </div>

                    <div>
                        <Input
                            type="password"
                            title='Пароль'
                            classname="mb-5"
                        // value={formData.loginPassword}
                        // changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                        // error={!!errors.loginPassword || !!passwordError}
                        // {...register('loginPassword', {
                        //   required: 'Password is required',
                        //   minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        // })}
                        // helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
                        />
                        <Input
                            type="password"
                            title='Подтвердите пароль'
                            classname="mb-5"
                        // value={formData.loginPassword}
                        // changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                        // error={!!errors.loginPassword || !!passwordError}
                        // {...register('loginPassword', {
                        //   required: 'Password is required',
                        //   minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        // })}
                        // helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
                        />
                        <div className="flex mb-5">
                            <Input
                                type="date"
                                title="Дата рождения"
                                classname="w-40"
                                id="date-input"
                                value={date}
                                changeValue={handleDateChange}
                            />
                            <div onClick={handleIconClick} className="mt-9 text-primary02 ml-1 cursor-pointer">
                                <Calendar className="pointer-events-none" />
                            </div>
                        </div>
                        <Input
                            type="text"
                            title='Номер телефона'
                            classname="mb-5"
                        // value={formData.loginPassword}
                        // changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                        // error={!!errors.loginPassword || !!passwordError}
                        // {...register('loginPassword', {
                        //   required: 'Password is required',
                        //   minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        // })}
                        // helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
                        />
                        <Input
                            type="text"
                            title='Email (требуется подтверждение)'
                            classname="mb-5"
                        // value={formData.loginPassword}
                        // changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                        // error={!!errors.loginPassword || !!passwordError}
                        // {...register('loginPassword', {
                        //   required: 'Password is required',
                        //   minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        // })}
                        // helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
                        />
                    </div>
                </div>
                <div className={`h-32 ${isToggled ? "bg-background06" : "bg-disabledFill"}`}>
                    <div className="flex ml-5">
                        <div className="mt-5 flex">
                            <div>
                                <div
                                    onClick={handleToggle}
                                    className={`w-10 h-5 flex items-center rounded-full cursor-pointer transition-colors duration-300 relative ${isToggled ? 'bg-primary02' : 'bg-opacity01'
                                        }`}
                                >
                                    <div
                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-0'
                                            }`}
                                    />
                                </div>
                            </div>
                            <div className="ml-5">
                                <div className="text-text01 text-lg font-semibold">Заказать обратный звонок</div>
                                <div className="text-text01 font-normal text-sm">После регистрации наш менеджер свяжется с вами и ответит на все вопросы системы</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="basic" title={t('Далее')} form={true} classname='w-full' />
            </form>
        </div>
    )
}

export default RegisterForm;