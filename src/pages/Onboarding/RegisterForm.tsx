import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
// import { Calendar } from 'feather-icons-react';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from "swr/mutation";
import { registerPlatformUser } from "@/services/api/platform";

type Props = {
    count: number;
    setCount: (key: number) => void;
    registerObj: { email: string };
    setRegisterObj: (obj: {email: string}) => void;
}

const RegisterForm: React.FC<Props> = ({ count, setCount, registerObj, setRegisterObj }: Props) => {
    const { t } = useTranslation();
    const [isToggled, setIsToggled] = useState(false);

    const defaultValues = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        phone: ''
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger, isMutating } = useSWRMutation(
        'user/auth/register',
        async () => registerPlatformUser({
            name: formData.name,
            birthday: new Date(`${formData.birthday}T13:24:45.742+03:00`),
            phone: formData.phone,
            email: formData.email,
            password: formData.password
        }) 
      );

    type FieldType = "name" | "email" | "password" | "confirmPassword" | "birthday" | "phone";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    // const handleIconClick = () => {
    //     const dateInput = document.getElementById("date-input");
    //     if (dateInput) {
    //         dateInput.focus();
    //         // Workaround to trigger date picker on focus
    //         (dateInput as HTMLInputElement).showPicker?.();
    //     }
    // };

    const onSubmit = async (data: unknown) => {
        console.log("Form data:", data);
        try {
            const result = await trigger();
            if(result) {
                console.log(result);
                setRegisterObj({email: formData.email});
                console.log(registerObj);
                setCount(count + 1);
            }
        } catch (error) {
            console.log("Register error:", error);
        }
    }

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-2">{t('Присоединяйтесь к Onvi-бизнес!')}</p>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} >
                <div className="overflow-y-auto pr-6 h-96">
                    <div>
                        <Input
                            type="text"
                            title='Имя пользователя'
                            classname="mb-0"
                            value={formData.name}
                            changeValue={(e) => handleInputChange('name', e.target.value)}
                            error={!!errors.name}
                            {...register('name', {
                                required: 'Name is required'
                            })}
                            helperText={errors.name?.message || ''}
                        />
                        <label className="text-xs text-text02 mb-5">Под этим именем вас будут знать другие пользователи Onvi-бизнес.</label>
                    </div>

                    <div>
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
                        <div className="flex mb-5">
                            <Input
                                type="date"
                                title="Дата рождения"
                                classname="w-40"
                                id="date-input"
                                value={formData.birthday}
                                changeValue={(e) => handleInputChange('birthday', e.target.value)}
                                error={!!errors.birthday}
                                {...register('birthday', {
                                    required: 'birthday is required'
                                })}
                                helperText={errors.birthday?.message || ''}
                            />
                            {/* <div onClick={handleIconClick} className="mt-9 text-primary02 ml-1 cursor-pointer">
                                <Calendar className="pointer-events-none" />
                            </div> */}
                        </div>
                        <Input
                            type="text"
                            title='Номер телефона'
                            classname="mb-5"
                            value={formData.phone}
                            changeValue={(e) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            {...register('phone', {
                                required: 'phone is required',
                                pattern: {
                                    value: /^\+79\d{9}$/,
                                    message: 'Phone number must start with +79 and be 11 digits long'
                                }
                            })}
                            helperText={errors.phone?.message || ''}
                        />
                        <Input
                            type="text"
                            title='Email (требуется подтверждение)'
                            classname="mb-5"
                            value={formData.email}
                            changeValue={(e) => handleInputChange('email', e.target.value)}
                            error={!!errors.email}
                            {...register('email', {
                                required: 'email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Invalid email format'
                                }
                            })}
                            helperText={errors.email?.message || ''}
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

                <Button type="basic" title={t('Далее')} form={true} classname='w-full' isLoading={isMutating} />
            </form>
        </div>
    )
}

export default RegisterForm;