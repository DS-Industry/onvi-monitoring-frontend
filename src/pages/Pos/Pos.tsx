import { useTranslation } from "react-i18next";
import SalyIamge from "@/assets/Saly-1.svg?react";
import React, { useRef, useState } from "react";
import NoDataUI from "@ui/NoDataUI.tsx";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate, useFilterOpen } from "@/components/context/useContext.tsx";
import DrawerCreate from "@ui/Drawer/DrawerCreate.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import { columnsPos } from "@/utils/OverFlowTableData.tsx";
import Button from "@ui/Button/Button.tsx";
import useSWR from "swr";
import { getPos, postCreatePos } from "@/services/api/pos/index.ts";
import { getOrganization, postCreateOrganization, postPosData } from "@/services/api/organization/index.ts";
import useSWRMutation from 'swr/mutation';
import Input from '@ui/Input/Input';
import DropdownInput from '@ui/Input/DropdownInput';
import useFormHook from "@/hooks/useFormHook";

const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [isData, setIsData] = useState(true);
    const { data, error, isLoading } = useSWR([`get-pos-7`], () => getPos(1))
    const { data: org, error: orgEr, isLoading: orgLoad } = useSWR([`get-org-7`], () => getOrganization(7));
    // const { data: pos, error: posError, mutate: posMutate } = useSWR([`post-pos`], () => postCreatePos(postData))
    const { buttonOn, setButtonOn } = useButtonCreate();
    const contentRef = useRef<HTMLDivElement>(null);
    const [startHour, setStartHour] = useState<number | null>(null);
    const [endHour, setEndHour] = useState<number | null>(null);

    const defaultValues = {
        name: '',
        monthlyPlan: null,
        timeWork: '',
        posMetaData: '',
        city: '',
        location: '',
        lat: null,
        lon: null,
        organizationId: null,
        carWashPosType: '',
        minSumOrder: null,
        maxSumOrder: null,
        stepSumOrder: null
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger: createPos, isMutating } = useSWRMutation('user/pos', async () => postPosData({
        name: formData.name,
        monthlyPlan: formData.monthlyPlan,
        timeWork: formData.timeWork,
        address: {
            city: formData.city,
            location: "Брусилова",
            lat: 10,
            lon: 10
        },
        organizationId: 1,
        carWashPosType: formData.carWashPosType,
        minSumOrder: formData.minSumOrder,
        maxSumOrder: formData.maxSumOrder,
        stepSumOrder: formData.stepSumOrder
    }));

    const handleInputChange = (field: any, value: any) => {
        const numericFields = ['monthlyPlan', 'stepSumOrder', 'minSumOrder', 'maxSumOrder'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value); // Update react-hook-form's internal value
    };

    const handleTimeWorkChange = (field: string, value: number) => {
        if (field === 'startHour') {
            setStartHour(value);
            setFormData((prev) => ({ ...prev, timeWork: `${value}${endHour ?? ''}` }));
            setValue('timeWork', `${value}${endHour ?? ''}`);
        } else {
            setEndHour(value);
            setFormData((prev) => ({ ...prev, timeWork: `${startHour ?? ''}${value}` }));
            setValue('timeWork', `${startHour ?? ''}${value}`);
        }
    };

    const onSubmit = async (data: any) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data); // Check if form data is being logged
        try {
            const result = await createPos(); // Ensure createPos() is called
            if (result) {
                console.log('API Response:', result);
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const poses: Pos[] = data?.map((item: any) => {
        return item;
    }).sort((a, b) => a.id - b.id) || [];

    const orgData = org?.map((organization) => ({
        value: organization.id,
        name: organization.name
    })) || [];
    return (
        <>
            {isData ? (
                <>
                    <div className="mt-8">
                        <OverflowTable
                            tableData={poses}
                            columns={columnsPos}
                            isDisplayEdit={true}
                            isUpdate={false}
                            nameUrl={'/administration/device'}
                        />
                    </div>
                </>
            ) : (<>
                {notificationVisible && (
                    <Notification
                        title="Юридическаое лицо"
                        message="Чтобы создать объект, сначала нужно ввести данные юридического лица во вкладке Администрирование!"
                        onClose={() => setNotificationVisible(false)}
                    />
                )}
                <NoDataUI
                    title="Пока не создан ни один объект"
                    description="Добавьте автомойку"
                >
                    <SalyIamge className="mx-auto" />
                </NoDataUI>
            </>
            )}


            <DrawerCreate>
                {notificationVisible && (
                    <Notification
                        title="Юридическаое лицо"
                        message="Чтобы создать объект, сначала нужно ввести данные юридического лица во вкладке Администрирование!"
                        onClose={() => setNotificationVisible(false)}
                    />
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">Создание объекта</span>
                    <Input
                        title={"Наименование объекта"}
                        type={'text'}
                        label={"Например, автомойка"}
                        classname="w-96"
                        {...register('name', { required: 'Name is required' })}
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    {/* <Input
                        title={"Город"}
                        type={'text'}
                        name={'city'}
                        label={"Город автомойки"}
                    /> */}
                    <Input
                        title={"Адрес"}
                        type={'text'}
                        label={"Адрес автомойки"}
                        classname="w-96"
                        {...register('city', { required: 'Address is required' })}
                        value={formData.city}
                        changeValue={(e) => handleInputChange('city', e.target.value)}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                    />
                    <div>
                        <label className="text-sm text-text02">Часы работы</label>
                        <div className="flex space-x-2">
                            <Input
                                type="number"
                                classname="w-40"
                                value={startHour !== null ? startHour : ''}
                                changeValue={(e) => handleTimeWorkChange('startHour', e.target.value)}
                                {...register('timeWork', { required: 'Time Work is required' })}
                                error={!!errors.timeWork}
                                helperText={errors.timeWork?.message}
                            />
                            <div className="flex justify-center items-center text-text02"> : </div>
                            <Input
                                type="number"
                                classname="w-40"
                                value={endHour !== null ? endHour : ''}
                                changeValue={(e) => handleTimeWorkChange('endHour', e.target.value)}
                                {...register('timeWork', { required: 'Time Work is required' })}
                                error={!!errors.timeWork}
                                helperText={errors.timeWork?.message}
                            />
                        </div>
                        <div className="flex mt-2">
                            <input type="checkbox" />
                            <div className="text-text02 ml-2">Круглосуточно</div>
                        </div>
                    </div>
                    <Input
                        title={"Месячный план"}
                        type={'number'}
                        defaultValue={'0'}
                        classname="w-48"
                        {...register('monthlyPlan', { required: 'Monthly Plan is required' })}
                        value={formData.monthlyPlan}
                        changeValue={(e) => handleInputChange('monthlyPlan', e.target.value)}
                        error={!!errors.monthlyPlan}
                        helperText={errors.monthlyPlan?.message}
                    />
                    <DropdownInput
                        title={"Компания"}
                        label={"Наименование компании"}
                        options={[
                            { name: "LLC ONVI", value: 1 },
                            // { name: `ООО “Мой-Ка”`, value: 2 },
                            // { name: "Добавить Компанию", value: 3 }
                        ]}
                        classname="w-96"
                        {...register('organizationId', { required: 'Organization ID is required' })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                    />
                    <DropdownInput
                        title={"Тип автомойки"}
                        label={"Мойка самообслуживания"}
                        options={[
                            { name: "МСО", value: "SelfService" },
                            { name: "Робот  мойка", value: "Portal" },
                            { name: "МСО + Робот  мойка", value: "SelfServiceAndPortal" }
                        ]}
                        classname="w-96"
                        {...register('carWashPosType', { required: 'Pos Type is required' })}
                        value={formData.carWashPosType}
                        onChange={(value) => handleInputChange('carWashPosType', value)}
                        error={!!errors.carWashPosType}
                        helperText={errors.carWashPosType?.message}
                    />
                    <div>
                        <label className="text-sm text-text02">Минимальный  шаг суммы заказа</label>
                        <Input
                            type="number"
                            classname="w-48"
                            {...register('stepSumOrder', { required: 'Step Sum Order is required' })}
                            value={formData.stepSumOrder}
                            changeValue={(e) => handleInputChange('stepSumOrder', e.target.value)}
                            error={!!errors.stepSumOrder}
                            helperText={errors.stepSumOrder?.message}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-text02">Минимальная сумма заказа</label>
                        <Input
                            type="number"
                            classname="w-48"
                            {...register('minSumOrder', { required: 'Min Sum Order is required' })}
                            value={formData.minSumOrder}
                            changeValue={(e) => handleInputChange('minSumOrder', e.target.value)}
                            error={!!errors.minSumOrder}
                            helperText={errors.minSumOrder?.message}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-text02">Максимальная сумма заказа</label>
                        <Input
                            type="number"
                            classname="w-48"
                            {...register('maxSumOrder', { required: 'Max Sum Order is required' })}
                            value={formData.maxSumOrder}
                            changeValue={(e) => handleInputChange('maxSumOrder', e.target.value)}
                            error={!!errors.maxSumOrder}
                            helperText={errors.maxSumOrder?.message}
                        />
                    </div>
                    <div>
                        <div>Фотографии</div>
                        <div>Максимальный количество фотографий: 6</div>
                        <Button
                            form={false}
                            iconPlus={true}
                            type="outline"
                            title="Скачать"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button
                            title='Отменить'
                            type='outline'
                            handleClick={() =>
                                setButtonOn(!buttonOn)}
                        />
                        <Button
                            title='Сохранить'
                            form={true}
                            handleClick={() => { }}
                            isLoading={isMutating}
                        />
                    </div>
                </form>

            </DrawerCreate>
        </>
    );
};

export default Pos;