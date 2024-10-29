import PosEmpty from "@/assets/EmptyPos.svg?react";
import React, { useState } from "react";
import NoDataUI from "@ui/NoDataUI.tsx";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate } from "@/components/context/useContext.tsx";
import DrawerCreate from "@ui/Drawer/DrawerCreate.tsx";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import { columnsPos } from "@/utils/OverFlowTableData.tsx";
import Button from "@ui/Button/Button.tsx";
import useSWR, { mutate } from "swr";
import { getPos } from "@/services/api/pos/index.ts";
import { postPosData } from "@/services/api/pos/index.ts";
import useSWRMutation from 'swr/mutation';
import Input from '@ui/Input/Input';
import DropdownInput from '@ui/Input/DropdownInput';
import useFormHook from "@/hooks/useFormHook";
import Filter from "@ui/Filter/Filter";
import SearchInput from "@/components/ui/Input/SearchInput";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";

interface Pos {
    id: number;
    name: string;
    slug: string;
    monthlyPlan: number;
    timeWork: string;
    organizationId: number;
    posMetaData: string;
    timezone: number;
    image: string;
    rating: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
    address:
    {
        id: number;
        city: string;
        location: string;
        lat: number;
        lon: number;
    };
    posType:
    {
        id: number;
        name: string;
        slug: string;
        carWashPosType: string;
        minSumOrder: number;
        maxSumOrder: number;
        stepSumOrder: number;
    };
}

const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const { data, isLoading: posLoading } = useSWR([`get-pos`], () => getPos(1), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [startHour, setStartHour] = useState<number | null>(null);
    const [endHour, setEndHour] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); 

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
            location: formData.location,
            lat: formData.lat,
            lon: formData.lon
        },
        organizationId: formData.organizationId,
        carWashPosType: formData.carWashPosType,
        minSumOrder: formData.minSumOrder,
        maxSumOrder: formData.maxSumOrder,
        stepSumOrder: formData.stepSumOrder
    }));

    type FieldType = "name" | "monthlyPlan" | "timeWork" | "posMetaData" | "city" | "location" | "lat" | "lon" | "organizationId" | "carWashPosType" | "minSumOrder" | "maxSumOrder" | "stepSumOrder";

    const handleInputChange = (field: FieldType, value: string | null) => {
        const numericFields = ['monthlyPlan', 'stepSumOrder', 'minSumOrder', 'maxSumOrder','lat','lon'];
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

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data); 
        try {
            const result = await createPos(); 
            if (result) {
                console.log('API Response:', result);
                mutate([`get-pos`]);
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const poses: Pos[] = data
        ?.filter((item: { name: string }) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) 
        .map((item: Pos) => item)
        .sort((a, b) => a.id - b.id) || [];

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    return (
        <>
            {
                posLoading ? (
                    <TableSkeleton columnCount={columnsPos.length} />
                )
                    :
                    poses.length > 0 ? (
                        <>
                            <Filter count={poses.length} searchTerm={searchTerm} setSearchTerm={handleSearchChange}>
                                {/* Pass any filter inputs you need here */}
                                <div className="flex">
                                    <SearchInput
                                        placeholder="Filter by name..."
                                        classname="w-64 mr-5 mb-1"
                                        searchType="outlined"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </Filter>
                            <div className="mt-8">
                                <OverflowTable
                                    tableData={poses}
                                    columns={columnsPos}
                                    isDisplayEdit={true}
                                    isUpdate={false}
                                    nameUrl={'/station/enrollments/device'}
                                />
                            </div>
                        </>
                    ) : (<>
                        {notificationVisible && (
                            <Notification
                                title={t("pos.companyName")}
                                message={t("pos.createObject")}
                                link={t("pos.goto")}
                                linkUrl="/administration/legalRights"
                                onClose={() => setNotificationVisible(false)}
                            />
                        )}
                        <NoDataUI
                            title={t("pos.noObject")}
                            description={t("pos.addCar")}
                        >
                            <PosEmpty className="mx-auto" />
                        </NoDataUI>
                    </>
                    )}


            <DrawerCreate>
                {notificationVisible && (
                    <Notification
                        title={t("organizations.legalEntity")}
                        message={t("pos.createObject")}
                        link={t("pos.goto")}
                        linkUrl="/administration/legalRights"
                        onClose={() => setNotificationVisible(false)}
                    />
                )}

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">{t("pos.creating")}</span>
                    <Input
                        title={t("pos.name")}
                        type={'text'}
                        label={t("pos.example")}
                        classname="w-96"
                        {...register('name', { required: 'Name is required' })}
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    <Input
                        title={t("pos.city")}
                        type={'text'}
                        label={t("pos.address")}
                        classname="w-96"
                        {...register('city', { required: 'City is required' })}
                        value={formData.city}
                        changeValue={(e) => handleInputChange('city', e.target.value)}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                    />
                    <Input
                        title={t("pos.location")}
                        type={'text'}
                        label={t("pos.location")}
                        classname="w-96"
                        {...register('location', { required: 'Location is required' })}
                        value={formData.location}
                        changeValue={(e) => handleInputChange('location', e.target.value)}
                        error={!!errors.location}
                        helperText={errors.location?.message}
                    />
                    <Input
                        title={t("pos.lat")}
                        type="number"
                        classname="w-48"
                        {...register('lat')}
                        value={formData.lat}
                        changeValue={(e) => handleInputChange('lat', e.target.value)}
                    />
                    <Input
                        title={t("pos.lon")}
                        type="number"
                        classname="w-48"
                        {...register('lon')}
                        value={formData.lon}
                        changeValue={(e) => handleInputChange('lon', e.target.value)}
                    />
                    <div>
                        <label className="text-sm text-text02">{t("pos.opening")}</label>
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
                            <div className="text-text02 ml-2">{t("pos.clock")}</div>
                        </div>
                    </div>
                    <Input
                        title={t("pos.monthly")}
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
                        title={t("pos.company")}
                        label={t("pos.companyName")}
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
                        title={t("pos.type")}
                        label={t("pos.self")}
                        options={[
                            { name: "МСО", value: "SelfService" },
                            { name: t("pos.robot"), value: "Portal" },
                            { name: `МСО + ${t("pos.robot")}`, value: "SelfServiceAndPortal" }
                        ]}
                        classname="w-96"
                        {...register('carWashPosType', { required: 'Pos Type is required' })}
                        value={formData.carWashPosType}
                        onChange={(value) => handleInputChange('carWashPosType', value)}
                        error={!!errors.carWashPosType}
                        helperText={errors.carWashPosType?.message}
                    />
                    <div>
                        <label className="text-sm text-text02">{t("pos.min")}</label>
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
                        <label className="text-sm text-text02">{t("pos.minAmount")}</label>
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
                        <label className="text-sm text-text02">{t("pos.maxAmount")}</label>
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
                        <div>{t("pos.photos")}</div>
                        <div>{t("pos.maxNumber")}</div>
                        <Button
                            form={false}
                            iconPlus={true}
                            type="outline"
                            title={t("pos.download")}
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() =>
                                setButtonOn(!buttonOn)}
                        />
                        <Button
                            title={t("organizations.save")}
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