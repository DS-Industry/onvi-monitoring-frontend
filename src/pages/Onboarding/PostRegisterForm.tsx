import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

const PostRegisterForm: React.FC = () => {
    const { t } = useTranslation();
    const [isToggled, setIsToggled] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState('');

    const handleToggle = () => {
        setIsToggled(!isToggled);
    };

    return (
        <div>
            <p className="text-3xl font-extrabold leading-[1.25] text-text01 mb-1">Регистрация прошла успешно</p>
            <p className="font-normal text-text01 text-base mb-2">Для лучшей работы сервиса необходимо заполнить следующие поля</p>
            <form>
                <DropdownInput
                    title="Укажите тип Юр. лица"
                    options={[{ value: "LegalEntity", name: "Юридическое лицо" },
                    { value: "IndividualEntrepreneur", name: "ИП" }
                    ]}
                    value={selectedEntity}
                    onChange={setSelectedEntity}
                    isSelectable={true}
                    classname="w-72"
                />
                <Input
                    type="text"
                    title='Наименование Юридического лица'
                    classname="mb-5" changeValue={() => { }}
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
                    type="text"
                    title='Наименование Бренда'
                    classname="mb-5" changeValue={() => { }}
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
                    title='Адрес мойки'
                    classname="mb-12" changeValue={() => { }}
                // value={formData.loginPassword}
                // changeValue={(e) => handleInputChange('loginPassword', e.target.value)}
                // error={!!errors.loginPassword || !!passwordError}
                // {...register('loginPassword', {
                //   required: 'Password is required',
                //   minLength: { value: 6, message: 'Password must be at least 6 characters' }
                // })}
                // helperText={errors.loginPassword?.message || errorPasswordMessage || ''}
                />
                <div className={`h-32 ${isToggled ? "bg-background06" : "bg-disabledFill"} mb-5`}>
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

                <Button type="basic" title={t('Зарегистрироваться')} form={true} classname='w-full' />
            </form>
        </div>
    )
}

export default PostRegisterForm;