import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import Filter from "@/components/ui/Filter/Filter";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import ProfilePhoto from "@/assets/ProfilePhoto.svg";
import Button from "@/components/ui/Button/Button";
import { useButtonCreate, useFilterOn } from "@/components/context/useContext";
import { columnsEmployee } from "@/utils/OverFlowTableData";
import useFormHook from "@/hooks/useFormHook";
import useSWR, { mutate } from "swr";
import { createWorker, getPositions, getWorkers } from "@/services/api/hr";
import { getPlacement } from "@/services/api/device";
import { useCity, useCurrentPage, usePageNumber, useSetCity, useSetCurrentPage, useSetPageNumber, useSetPageSize } from "@/hooks/useAuthStore";
import { getOrganization } from "@/services/api/organization";
import useSWRMutation from "swr/mutation";
import { Select, Input as AntInput } from "antd";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useLocation } from "react-router-dom";

type Worker = {
    name: string;
    hrPositionId: string;
    placementId: string;
    organizationId: string;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary: string;
    dailySalary: string;
    percentageSalary: string;
    gender?: string;
    citizenship?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportExtradition?: string;
    passportDateIssue?: Date;
    inn?: string;
    snils?: string;
}

type WorkerParams = {
    placementId: number | string;
    hrPositionId: number | '*';
    organizationId: number | '*';
    name?: string;
    page?: number;
    size?: number;
}

const Employees: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [notificationVisibleForm, setNotificationVisibleForm] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [name, setName] = useState<string | undefined>(undefined);
    const [organizationId, setOrganizationId] = useState<number | "*">("*");
    const [positionId, setPositionId] = useState<number | "*">("*");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const city = useCity();
    const setCity = useSetCity();
    const pageNumber = usePageNumber();
    const setPageNumber = useSetPageNumber();
    const currentPage = useCurrentPage();
    const { filterOn } = useFilterOn();
    const setCurrentPage = useSetCurrentPage();
    const setTotalCount = useSetPageSize();
    const location = useLocation();
    const pageSize = usePageNumber();

    const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR(
        [`get-organization`],
        () => getOrganization({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        });

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const cities: { name: string; value: number; }[] = cityData?.map((item) => ({ name: item.city, value: item.id })) || [];

    const organizations: { name: string; value: number | string; label: string; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id, label: item.name })) || [];

    const allObj = {
        name: allCategoriesText,
        value: "*",
        label: allCategoriesText,
    };

    const positions: { name: string; value: number | string; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

    const { data: workersData, isLoading: workersLoading, mutate: positionsMutating } = useSWR([`get-workers`], () => getWorkers({
        placementId: dataFilter.placementId,
        hrPositionId: dataFilter.hrPositionId,
        organizationId: dataFilter.organizationId,
        name: dataFilter.name,
        page: dataFilter.page,
        size: dataFilter.size
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const tableData = workersData?.map((item) => ({
        ...item.props,
        placement: cities.find((city) => city.value === item.props.placementId)?.name,
        organization: organizations.find((org) => org.value === item.props.organizationId)?.name,
        position: positions.find((pos) => pos.value === item.props.hrPositionId)?.name
    })) || [];

    const initialFilter = {
        placementId: city,
        hrPositionId: positionId,
        organizationId: organizationId,
        name: name,
        page: currentPage,
        size: pageNumber
    }

    useEffect(() => {
        setCurrentPage(1);
        setDataFilter((prevFilter) => ({
            ...prevFilter,
            page: 1
        }));
    }, [location, setCurrentPage]);

    const [dataFilter, setDataFilter] = useState<WorkerParams>(initialFilter);

    const totalRecords = workersData?.length || 0;
    const maxPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        if (currentPage > maxPages) {
            setCurrentPage(maxPages > 0 ? maxPages : 1);
            setDataFilter((prevFilter) => ({
                ...prevFilter,
                page: maxPages > 0 ? maxPages : 1
            }));
        }
    }, [maxPages, currentPage, setCurrentPage]);

    const handleDataFilter = (newFilterData: Partial<WorkerParams>) => {
        setDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.placementId) setCity(newFilterData.placementId);
        if (newFilterData.hrPositionId) setPositionId(newFilterData.hrPositionId);
        if (newFilterData.organizationId) setOrganizationId(newFilterData.organizationId);
        if (newFilterData.name) setName(newFilterData.name);
        if (newFilterData.size) setPageNumber(newFilterData.size);
    }

    useEffect(() => {
        handleDataFilter({
            placementId: city,
            hrPositionId: positionId,
            organizationId: organizationId,
            name: name,
            page: currentPage,
            size: pageNumber
        })
    }, [filterOn]);

    useEffect(() => {
        positionsMutating().then(() => setIsTableLoading(false));
    }, [dataFilter, positionsMutating]);

    useEffect(() => {
        if (!workersLoading && workersData)
            setTotalCount(workersData.length)
    }, [workersData, workersLoading, setTotalCount]);

    const handleClear = () => {
        setCity(city);
        setPositionId("*");
        setOrganizationId("*");
        setName(undefined);
    }

    const defaultValues: Worker = {
        name: "",
        hrPositionId: '',
        placementId: '',
        organizationId: '',
        startWorkDate: undefined,
        phone: undefined,
        email: undefined,
        description: undefined,
        monthlySalary: '',
        dailySalary: '',
        percentageSalary: '',
        gender: undefined,
        citizenship: undefined,
        passportSeries: undefined,
        passportNumber: undefined,
        passportExtradition: undefined,
        passportDateIssue: undefined,
        inn: undefined,
        snils: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createEmp, isMutating } = useSWRMutation(['create-employee'], async () => createWorker({
        name: formData.name,
        hrPositionId: formData.hrPositionId,
        placementId: formData.placementId,
        organizationId: formData.organizationId,
        startWorkDate: formData.startWorkDate,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        monthlySalary: formData.monthlySalary,
        dailySalary: formData.dailySalary,
        percentageSalary: formData.percentageSalary,
        gender: formData.gender,
        citizenship: formData.citizenship,
        passportSeries: formData.passportSeries,
        passportNumber: formData.passportNumber,
        passportExtradition: formData.passportExtradition,
        passportDateIssue: formData.passportDateIssue,
        inn: formData.inn,
        snils: formData.snils
    }, selectedFile));

    type FieldType = "name" | "description" | "hrPositionId" | "placementId" | "organizationId" | "startWorkDate" | "phone" | "email" | "monthlySalary" | "dailySalary" | "percentageSalary" | "gender" | "citizenship" | "passportSeries" | "passportNumber" | "passportExtradition" | "passportDateIssue" | "inn" | "snils";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["monthlySalary", "dailySalary", "percentageSalary"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);

        try {
            const result = await createEmp();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-workers`]);
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    return (
        <div>
            <Filter count={tableData.length} hideDateTime={true} address={city} setAddress={setCity} handleClear={handleClear} hideSearch={true}>
                <div>
                    <div className="text-sm text-text02">{t("roles.job")}</div>
                    <Select
                        className="w-full sm:w-80"
                        placeholder={t("warehouse.notSel")}
                        options={[...positions, allObj]}
                        value={positionId}
                        onChange={(value) => setPositionId(value)}
                        dropdownRender={(menu) => (
                            <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                {menu}
                            </div>
                        )}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                    <Select
                        className="w-full sm:w-80"
                        placeholder={t("warehouse.notSel")}
                        options={[...organizations, allObj]}
                        value={organizationId}
                        onChange={(value) => setOrganizationId(value)}
                        dropdownRender={(menu) => (
                            <div style={{ maxHeight: 100, overflowY: "auto" }}>
                                {menu}
                            </div>
                        )}
                    />
                </div>
                <div>
                    <div className="text-sm text-text02">{t("hr.full")}</div>
                    <AntInput
                        className="w-full sm:w-80"
                        placeholder={t("hr.enter")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </Filter>
            <div className="mt-5">
                {notificationVisible && (
                    <Notification
                        title={t("routes.employees")}
                        message={t("hr.to")}
                        onClose={() => setNotificationVisible(false)}
                        showEmp={true}
                    />
                )}
                {workersLoading || isTableLoading ?
                    <TableSkeleton columnCount={columnsEmployee.length} />
                    : <div className="mt-8">
                        <DynamicTable
                            data={tableData}
                            columns={columnsEmployee}
                            navigableFields={[{ key: "name", getPath: () => '/hr/employees/profile' }]}
                            showPagination={true}
                        />
                    </div>}
            </div>
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("routes.addE")}</div>
                    {notificationVisibleForm && (
                        <Notification
                            title={t("hr.att")}
                            message={t("hr.if")}
                            message2={t("hr.ifThe")}
                            onClose={() => setNotificationVisibleForm(false)}
                        />
                    )}
                    <div className="flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <div className="font-semibold text-2xl text-text01">{t("warehouse.basic")}</div>
                    <Input
                        title={`${t("hr.full")}*`}
                        label={t("hr.enter")}
                        type={"text"}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("roles.job")}*`}
                        label={t("hr.selectPos")}
                        options={positions}
                        classname="w-64"
                        {...register('hrPositionId', {
                            required: 'hrPositionId is required',
                            validate: (value) =>
                                (value !== '') || "Pos ID is required"
                        })}
                        value={formData.hrPositionId}
                        onChange={(value) => handleInputChange('hrPositionId', value)}
                        error={!!errors.hrPositionId}
                        helperText={errors.hrPositionId?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("pos.city")} *`}
                        label={cities.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={cities}
                        classname="w-64"
                        {...register('placementId', {
                            required: 'Placement Id is required',
                            validate: (value) =>
                                (value !== '') || "Organization ID is required"
                        })}
                        value={formData.placementId}
                        onChange={(value) => handleInputChange('placementId', value)}
                        error={!!errors.placementId}
                        helperText={errors.placementId?.message}
                    />
                    <DropdownInput
                        title={`${t("warehouse.organization")} *`}
                        label={organizations.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={organizations}
                        classname="w-64"
                        {...register('organizationId', {
                            required: 'Organization Id is required',
                            validate: (value) =>
                                (value !== '') || "Organization ID is required"
                        })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("hr.date")}</div>
                        <Input
                            type={"date"}
                            classname="w-40"
                            value={formData.startWorkDate}
                            changeValue={(e) => handleInputChange('startWorkDate', e.target.value)}
                            {...register('startWorkDate')}
                        />
                    </div>
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-80"
                        value={formData.phone}
                        changeValue={(e) => handleInputChange('phone', e.target.value)}
                        {...register('phone', {
                            pattern: {
                                value: /^\+79\d{9}$/,
                                message: 'Phone number must start with +79 and be 11 digits long'
                            }
                        })}
                        error={!!errors.phone}
                        helperText={errors.phone?.message || ""}
                    />
                    <Input
                        type=""
                        title={"E-mail"}
                        label={t("marketing.enterEmail")}
                        classname="w-80"
                        value={formData.email}
                        changeValue={(e) => handleInputChange('email', e.target.value)}
                        {...register('email')}
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("warehouse.about")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.description}
                        changeValue={(e) => handleInputChange('description', e.target.value)}
                        {...register('description')}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("profile.photo")}</div>

                        <div
                            className="flex space-x-2 items-center cursor-pointer"
                            onClick={() => document.getElementById("photo-upload")?.click()}
                        >
                            <img
                                src={imagePreview || ProfilePhoto}
                                alt="Profile"
                                className="w-16 h-16 object-cover rounded-full border border-gray-300"
                                loading="lazy"
                            />
                            <div className="text-primary02 font-semibold">{t("hr.upload")}</div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="text-text01 font-semibold text-2xl">{t("hr.salary")}</div>
                    <Input
                        title={`${t("hr.month")}*`}
                        type={"number"}
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.monthlySalary}
                        changeValue={(e) => handleInputChange('monthlySalary', e.target.value)}
                        error={!!errors.monthlySalary}
                        {...register('monthlySalary', { required: 'monthlySalary is required' })}
                        helperText={errors.monthlySalary?.message || ''}
                    />
                    <Input
                        title={`${t("hr.daily")}*`}
                        type={"number"}
                        classname="w-44"
                        value={formData.dailySalary}
                        changeValue={(e) => handleInputChange('dailySalary', e.target.value)}
                        error={!!errors.dailySalary}
                        {...register('dailySalary', { required: 'dailySalary is required' })}
                        helperText={errors.dailySalary?.message || ''}
                    />
                    <Input
                        title={`${t("marketing.per")}*`}
                        type={"number"}
                        classname="w-44"
                        value={formData.percentageSalary}
                        changeValue={(e) => handleInputChange('percentageSalary', e.target.value)}
                        error={!!errors.percentageSalary}
                        {...register('percentageSalary', { required: 'percentageSalary is required' })}
                        helperText={errors.percentageSalary?.message || ''}
                    />
                    <div className="text-text01 font-semibold text-2xl">{t("hr.add")}</div>
                    <DropdownInput
                        title={`${t("marketing.floor")}`}
                        label={t("warehouse.notSel")}
                        options={[
                            { name: t("marketing.man"), value: "Man" },
                            { name: t("marketing.woman"), value: "Woman" }
                        ]} classname="w-64"
                        {...register('gender')}
                        value={formData.gender}
                        onChange={(value) => handleInputChange('gender', value)}
                    />
                    <Input
                        type=""
                        title={t("hr.citi")}
                        label={t("hr.enterCiti")}
                        classname="w-80"
                        value={formData.citizenship}
                        changeValue={(e) => handleInputChange('citizenship', e.target.value)}
                        {...register('citizenship')}
                    />
                    <Input
                        title={t("hr.passportSeries")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.passportSeries}
                        changeValue={(e) => handleInputChange('passportSeries', e.target.value)}
                        {...register('passportSeries')}
                    />
                    <Input
                        type="number"
                        title={t("hr.passportNumber")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.passportNumber}
                        changeValue={(e) => handleInputChange('passportNumber', e.target.value)}
                        {...register('passportNumber')}
                    />
                    <Input
                        title={t("hr.passportExtradition")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.passportExtradition}
                        changeValue={(e) => handleInputChange('passportExtradition', e.target.value)}
                        {...register('passportExtradition')}
                    />
                    <Input
                        type="date"
                        title={t("hr.passportDateIssue")}
                        classname="w-40"
                        inputType="secondary"
                        value={formData.passportDateIssue}
                        changeValue={(e) => handleInputChange('passportDateIssue', e.target.value)}
                        {...register('passportDateIssue')}
                    />
                    <Input
                        type=""
                        title={t("marketing.inn")}
                        classname="w-80"
                        value={formData.inn}
                        changeValue={(e) => handleInputChange('inn', e.target.value)}
                        {...register('inn')}
                    />
                    <Input
                        type=""
                        title={t("hr.snils")}
                        classname="w-80"
                        value={formData.snils}
                        changeValue={(e) => handleInputChange('snils', e.target.value)}
                        {...register('snils')}
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type="outline"
                            handleClick={() => {
                                setButtonOn(!buttonOn);
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("routes.addE")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default Employees;