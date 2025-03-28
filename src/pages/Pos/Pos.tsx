import PosEmpty from "@/assets/EmptyPos.png";
import React, { useState } from "react";
import NoDataUI from "@ui/NoDataUI.tsx";
import Notification from "@ui/Notification.tsx";
import { useButtonCreate } from "@/components/context/useContext.tsx";
import DrawerCreate from "@ui/Drawer/DrawerCreate.tsx";
import { columnsPos } from "@/utils/OverFlowTableData.tsx";
import Button from "@ui/Button/Button.tsx";
import useSWR, { mutate } from "swr";
import { postPosData } from "@/services/api/pos/index.ts";
import useSWRMutation from 'swr/mutation';
import Input from '@ui/Input/Input';
import DropdownInput from '@ui/Input/DropdownInput';
import useFormHook from "@/hooks/useFormHook";
import Filter from "@ui/Filter/Filter";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";
import { getContactById, getOrganization, getOrganizationContactById } from "@/services/api/organization";
import SearchInput from "@/components/ui/Input/SearchInput";
import { getPoses } from "@/services/api/equipment";
import { useCity, useSetCity } from "@/hooks/useAuthStore";
import { getPlacement } from "@/services/api/device";
import DynamicTable from "@/components/ui/Table/DynamicTable";

type Pos = {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationId: number;
    placementId: number;
    timezone: number;
    posStatus: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: number;
    updatedById: number;
}

type OrganizationResponse = {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationStatus: string;
    organizationType: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: number;
}

type OrgContactResponse = {
    name: string;
    address: string;
    status: string;
    type: string;
}

type ContactResponse = {
    name: string;
    surname: string;
    middlename: string;
    email: string;
    position: string;
}

const fetchOrgContact = async (id: number) => {
    if (!id) return null; // Prevent invalid API calls
    return getOrganizationContactById(id);
};

const fetchContact = async (id: number) => {
    if (!id) return null; // Prevent invalid API calls
    return getContactById(id);
};

const Pos: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const address = useCity();
    const setCity = useSetCity();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { data, isLoading: posLoading } = useSWR([`get-pos`, address], () => getPoses({
        placementId: address
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR(buttonOn ? [`get-org`, address] : null, () => getOrganization({
        placementId: address
    }));

    const { data: placementData } = useSWR([`get-placement`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const placements: { country: string; city: string; value: number; }[] = placementData?.map((item) => ({ country: item.country, city: item.city, value: item.id })) || [];

    const [startHour, setStartHour] = useState<number | null>(null);
    const [endHour, setEndHour] = useState<number | null>(null);

    const organizations: OrganizationResponse[] = organizationData
        ?.map((item: OrganizationResponse) => item)
        .sort((a, b) => a.id - b.id) || [];

    const organization: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

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

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

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
        const numericFields = ['monthlyPlan', 'stepSumOrder', 'minSumOrder', 'maxSumOrder', 'lat', 'lon'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
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

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setButtonOn(false);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {
            const result = await createPos();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-pos`, address]);
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const organizationIds = Array.from(new Set(data?.map((item) => item.organizationId)));

    const createIds = Array.from(new Set(data?.map((item) => item.createdById)));

    const updateIds = Array.from(new Set(data?.map((item) => item.updatedById)));

    const { data: orgContacts } = useSWR(
        organizationIds.length ? ["organizationContacts", organizationIds] : null,
        async () => {
            const responses = await Promise.all(organizationIds.map(fetchOrgContact));
            return responses.reduce((acc, contact, idx) => {
                if (contact) acc[organizationIds[idx]] = contact;
                return acc;
            }, {} as Record<number, OrgContactResponse>);
        }
    );

    const { data: createContacts } = useSWR(
        organizationIds.length ? ["createContacts", createIds] : null,
        async () => {
            const responses = await Promise.all(createIds.map(fetchContact));
            return responses.reduce((acc, contact, idx) => {
                if (contact) acc[createIds[idx]] = contact;
                return acc;
            }, {} as Record<number, ContactResponse>);
        }
    );

    const { data: updateContacts } = useSWR(
        organizationIds.length ? ["updateContacts", updateIds] : null,
        async () => {
            const responses = await Promise.all(updateIds.map(fetchContact));
            return responses.reduce((acc, contact, idx) => {
                if (contact) acc[updateIds[idx]] = contact;
                return acc;
            }, {} as Record<number, ContactResponse>);
        }
    );

    const poses: Pos[] = data
        ?.map((item: Pos) => ({
            ...item,
            organizationName: orgContacts?.[item.organizationId]?.name || "-",
            status: t(`tables.${item.posStatus}`),
            createdByName: `${createContacts?.[item.createdById]?.name || ""} ${createContacts?.[item.createdById]?.surname || ""}` || "-",
            updatedByName: `${updateContacts?.[item.updatedById]?.name || ""} ${updateContacts?.[item.updatedById]?.surname || ""}` || "-",
            city: placements.find((place) => place.value === item.placementId)?.city || "",
            country: placements.find((place) => place.value === item.placementId)?.country || ""
        }))
        ?.filter((pos) => pos.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => a.id - b.id) || [];

    const handleClear = () => {
        setSearchTerm("");
    }

    return (
        <>
            <Filter count={poses.length} hideDateTime={true} handleClear={handleClear} address={address} setAddress={setCity} hideSearch={true}>
                <div className="flex">
                    <SearchInput
                        title={t("equipment.carWash")}
                        value={searchTerm}
                        searchType="outlined"
                        classname="ml-2"
                        onChange={(value) => setSearchTerm(value)}
                    />
                </div>
            </Filter>
            {
                posLoading ? (
                    <TableSkeleton columnCount={columnsPos.length} />
                )
                    :
                    poses.length > 0 ? (
                        <>
                            <div className="mt-8">
                                <DynamicTable
                                    data={poses}
                                    columns={columnsPos}
                                    isDisplayEdit={true}
                                    // isUpdate={false}
                                    navigableFields={[{ key: "name", getPath: () => '/station/enrollments/devices' }]}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {notificationVisible && organizations.length === 0 && (
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
                                <img src={PosEmpty} className="mx-auto" />
                            </NoDataUI>
                        </>
                    )}


            <DrawerCreate onClose={resetForm}>
                {notificationVisible && organizations.length === 0 && (
                    <Notification
                        title={t("organizations.legalEntity")}
                        message={t("pos.createObject")}
                        link={t("pos.goto")}
                        linkUrl="/administration/legalRights"
                        onClose={() => setNotificationVisible(false)}
                    />
                )}

                <form className="space-y-6 w-full max-w-2xl mx-auto p-4" onSubmit={handleSubmit(onSubmit)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5">{t("pos.creating")}</span>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            title={t("pos.name")}
                            type={'text'}
                            label={t("pos.example")}
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
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
                            options={organization}
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
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
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() =>
                                resetForm()
                            }
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