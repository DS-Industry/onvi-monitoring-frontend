import SearchInput from "@/components/ui/Input/SearchInput";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import CalendarComponent from "@/components/ui/Calendar/CalendarComponent";
import { useButtonCreate } from "@/components/context/useContext";
import type { DatePickerProps } from 'antd';
import { DatePicker, Skeleton } from 'antd';
import useSWR, { mutate } from "swr";
import { getPositions, getWorkerById, getWorkers, updateWorker } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";

type UpdateWorkerRequest = {
    workerId: string;
    hrPositionId?: string;
    placementId?: string;
    startWorkDate?: Date;
    phone?: string;
    email?: string;
    description?: string;
    monthlySalary?: string;
    dailySalary?: string;
    percentageSalary?: string;
    gender?: string;
    citizenship?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportExtradition?: string;
    passportDateIssue?: Date;
    inn?: string;
    snils?: string;
}

const EmployeeProfile: React.FC = () => {
    const { t } = useTranslation();
    const [searchEmp, setSearchEmp] = useState("");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const { buttonOn } = useButtonCreate();
    const location = useLocation();
    const [workerId, setWorkerId] = useState(location.state.ownerId);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: positionData } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const positions: { name: string; value: number; label: string; }[] = positionData?.map((item) => ({ name: item.props.name, value: item.props.id, label: item.props.name })) || [];

    const getInitials = (fullName: string) => {
        const words = fullName.trim().split(" ");

        if (words.length < 2) return "";

        return words.slice(0, 2).map(word => word[0].toUpperCase()).join("");
    }


    const { data: employeeData, isLoading: loadingEmployee, isValidating } = useSWR(workerId !== 0 ? [`get-employee-by-id`, workerId] : null, () => getWorkerById(workerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const employee = employeeData?.props;

    const { data: workersData, isLoading: loadingWorkers, isValidating: validatingWorkers } = useSWR([`get-workers`, employee], () => getWorkers({
        placementId: "*",
        hrPositionId: "*",
        organizationId: "*",
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const employeeDetails = workersData?.map((worker) => ({
        fullName: worker.props.name,
        job: positions.find((pos) => pos.value === worker.props.hrPositionId)?.name,
        workerId: worker.props.id,
        avatar: worker.props.avatar
    })).filter((emp) => emp.fullName.toLowerCase().includes(searchEmp.toLowerCase())) || [];

    const tabs = [
        { id: 'info', name: t("hr.info") },
        { id: 'addi', name: t("hr.addi") },
        { id: 'salary', name: t("hr.salary") },
        // { id: 'sch', name: t("finance.sch") }
    ];

    const defaultValues: UpdateWorkerRequest = {
        workerId: location.state.ownerId,
        hrPositionId: undefined,
        placementId: undefined,
        startWorkDate: undefined,
        phone: undefined,
        email: undefined,
        description: undefined,
        monthlySalary: undefined,
        dailySalary: undefined,
        percentageSalary: undefined,
        gender: undefined,
        citizenship: undefined,
        passportSeries: undefined,
        passportNumber: undefined,
        passportExtradition: undefined,
        passportDateIssue: undefined,
        inn: undefined,
        snils: undefined
    }

    useEffect(() => {
        if (employee?.avatar)
            setImagePreview("https://storage.yandexcloud.net/onvi-business/avatar/worker/" + employee.avatar);
        else
            setImagePreview(null);
    }, [employee?.avatar])

    const scheduleValues = {
        sch: 0,
        repeat: 0,
        openingHour: 0,
        openingMin: 0,
        closingHour: 0,
        closingMinute: 0,
        date: ''
    }

    const [formData, setFormData] = useState(defaultValues);

    const [scheduleData, setScheduleData] = useState(scheduleValues);

    const onChange: DatePickerProps['onChange'] = (_date, dateString) => {
        setScheduleData((prev) => ({ ...prev, date: dateString.toString() }))
        const year = Number(dateString.toString().split("-")[0]);
        const startIndex = Number(dateString.toString().split("-")[1]);
        console.log("Date string: ", dateString.toString(), year, startIndex);
        setYear(year);
        setStartIndex(startIndex - 1);
    };

    useEffect(() => {
        if (employee)
            setFormData({
                ...employee,
                workerId: employee.id,
                inn: employee.inn === null ? undefined : employee.inn,
                snils: employee.snils === null ? undefined : employee.snils,
                phone: employee.phone === null ? undefined : employee.phone,
                email: employee.email === null ? undefined : employee.email,
                gender: employee.gender === null ? undefined : employee.gender,
                description: employee.description === null ? undefined : employee.description,
                citizenship: employee.citizenship === null ? undefined : employee.citizenship,
                passportSeries: employee.passportSeries === null ? undefined : employee.passportSeries,
                passportExtradition: employee.passportExtradition === null ? undefined : employee.passportExtradition,
                passportNumber: employee.passportNumber === null ? undefined : employee.passportNumber,
                startWorkDate: employee.startWorkDate ? employee.startWorkDate.slice(0, 10) : undefined,
                passportDateIssue: employee.passportDateIssue ? employee.passportDateIssue.slice(0, 10) : undefined,
            });
    }, [employee]);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger: updateEmp } = useSWRMutation(['update-employee'], async () => updateWorker({
        workerId: formData.workerId,
        hrPositionId: formData.hrPositionId,
        placementId: formData.placementId,
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

    type FieldType = "workerId" | "description" | "hrPositionId" | "placementId" | "startWorkDate" | "phone" | "email" | "monthlySalary" | "dailySalary" | "percentageSalary" | "gender" | "citizenship" | "passportSeries" | "passportNumber" | "passportExtradition" | "passportDateIssue" | "inn" | "snils";

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

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);

        try {
            const result = await updateEmp();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-employee-by-id`, workerId]);
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const months = [
        { name: "Январь", en: "January" },
        { name: "Февраль", en: "February" },
        { name: "Март", en: "March" },
        { name: "Апрель", en: "April" },
        { name: "Май", en: "May" },
        { name: "Июнь", en: "June" },
        { name: "Июль", en: "July" },
        { name: "Август", en: "August" },
        { name: "Сентябрь", en: "September" },
        { name: "Октябрь", en: "October" },
        { name: "Ноябрь", en: "November" },
        { name: "Декабрь", en: "December" },
    ];

    const [startIndex, setStartIndex] = useState(4);
    const [year, setYear] = useState(2024);

    const handlePrev = () => {
        if (startIndex > 0) {
            setStartIndex(startIndex - 1);
        } else {
            setStartIndex(9);
            setYear(year - 1);
        }
    };

    const handleNext = () => {
        if (startIndex < months.length - 3) {
            setStartIndex(startIndex + 1);
        } else {
            setStartIndex(0);
            setYear(year + 1);
        }
    };

    const handlePrevYear = () => {
        setYear(year - 1);
    };

    const handleNextYear = () => {
        setYear(year + 1);
    };

    useEffect(() => {
        if (buttonOn) {
            handleSubmit(onSubmit)();
        }
    }, [buttonOn]);

    const saveScheduleData = () => {
        console.log("Schedule data: ", scheduleData);
    }

    return (
        <div className="mt-2">
            <hr />
            <div className="flex flex-col md:flex-row">
                <div className="md:w-72 w-full border-r border-opacity01 min-h-screen p-4 space-y-4">
                    <div className="flex space-x-2 text-primary02 cursor-pointer" onClick={() => navigate(-1)}>
                        <Icon icon="chevron-left" className="h-6 w-6" />
                        <div>{t("login.back")}</div>
                    </div>
                    <SearchInput
                        value={searchEmp}
                        placeholder={t("hr.search")}
                        searchType="outlined"
                        onChange={(value) => setSearchEmp(value)}
                    />
                    <div className="w-full md:w-60 max-h-[480px] overflow-y-auto">
                        {loadingWorkers || validatingWorkers ? (
                            [...Array(5)].map((_, index) => (
                                <div key={index} className="flex flex-col space-y-4 mb-4">
                                    <Skeleton.Input style={{ width: '20%' }} active={true} />
                                    <Skeleton.Input style={{ width: '30%' }} active={true} />
                                </div>
                            ))
                        ) : employeeDetails.map((emp) => (
                            <div className="flex rounded-lg hover:bg-background05 p-2.5 cursor-pointer space-x-2" onClick={() => setWorkerId(emp.workerId)}>
                                {emp.avatar ? (
                                    <img
                                        src={"https://storage.yandexcloud.net/onvi-business/avatar/worker/" + emp.avatar}
                                        alt="Profile"
                                        className="rounded-full w-10 h-10 object-cover"
                                    />
                                ) : <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                                    {getInitials(emp.fullName)}
                                </div>}
                                <div>
                                    <div className="text-text01 font-semibold max-w-44 truncate overflow-hidden whitespace-nowrap">{emp.fullName}</div>
                                    <div className="text-text02 text-sm">{emp.job}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-4 w-full">
                    <div className="flex flex-wrap sm:flex-nowrap space-x-4 border-b mb-6 w-fit overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`p-2 flex-1 min-w-[120px] sm:w-40 text-center ${activeTab === tab.id ? 'text-text01 border-b-[3px] border-primary02' : 'text-text02'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {loadingEmployee || isValidating ? (
                            <div className="mt-4">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="flex flex-col space-y-4 mb-4">
                                        <Skeleton.Input style={{ width: '20%' }} active={true} />
                                        <Skeleton.Input style={{ width: '30%' }} active={true} />
                                    </div>
                                ))}
                            </div>
                        ) : <div className="mt-4">
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-text02">{t("finance.status")}</div>
                                        <div className="rounded-2xl py-[2px] px-2 flex items-center gap-2 w-36 text-[#00A355] bg-[#D1FFEA]">
                                            <span className="w-2 h-2 bg-[#00A355] rounded-full"></span>
                                            {t("tables.ACTIVE")}
                                        </div>
                                    </div>
                                    <DropdownInput
                                        title={`${t("roles.job")}`}
                                        label={t("hr.selectPos")}
                                        options={positions}
                                        classname="w-full md:w-64"
                                        {...register('hrPositionId')}
                                        value={formData.hrPositionId}
                                        onChange={(value) => handleInputChange('hrPositionId', value)}
                                        inputType="secondary"
                                    />
                                    <div>
                                        <div className="text-sm text-text02">{t("hr.date")}</div>
                                        <Input
                                            type={"date"}
                                            classname="w-full md:w-40"
                                            value={formData.startWorkDate}
                                            changeValue={(e) => handleInputChange('startWorkDate', e.target.value)}
                                            {...register('startWorkDate')}
                                            inputType="secondary"
                                        />
                                    </div>
                                    <Input
                                        type=""
                                        title={t("profile.telephone")}
                                        label={t("warehouse.enterPhone")}
                                        classname="w-full md:w-80"
                                        value={formData.phone}
                                        changeValue={(e) => handleInputChange('phone', e.target.value)}
                                        {...register('phone')}
                                        inputType="secondary"
                                    />
                                    <Input
                                        type=""
                                        title={"E-mail"}
                                        label={t("marketing.enterEmail")}
                                        classname="w-full md:w-80"
                                        value={formData.email}
                                        changeValue={(e) => handleInputChange('email', e.target.value)}
                                        {...register('email')}
                                        inputType="secondary"
                                    />
                                    <MultilineInput
                                        title={t("warehouse.desc")}
                                        label={t("warehouse.about")}
                                        classname="w-full md:w-80"
                                        inputType="secondary"
                                        value={formData.description}
                                        changeValue={(e) => handleInputChange('description', e.target.value)}
                                        {...register('description')}
                                    />
                                    <div>
                                        <div className="text-sm text-text02">{t("profile.photo")}</div>
                                        <label className="cursor-pointer">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Profile"
                                                    className="rounded-full w-10 h-10 object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                                                    {getInitials(employee?.name || "")}
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                            {activeTab === "addi" && (<div className="space-y-4">
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
                                    classname="w-full md:w-80"
                                    value={formData.citizenship}
                                    changeValue={(e) => handleInputChange('citizenship', e.target.value)}
                                    {...register('citizenship')}
                                    inputType="secondary"
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
                                    classname="w-full md:w-80"
                                    value={formData.inn}
                                    changeValue={(e) => handleInputChange('inn', e.target.value)}
                                    {...register('inn')}
                                    inputType="secondary"
                                />
                                <Input
                                    type=""
                                    title={t("hr.snils")}
                                    classname="w-full md:w-80"
                                    value={formData.snils}
                                    changeValue={(e) => handleInputChange('snils', e.target.value)}
                                    {...register('snils')}
                                    inputType="secondary"
                                />
                            </div>)}
                            {activeTab === "salary" && (<div className="space-y-4">
                                <Input
                                    title={`${t("hr.month")}`}
                                    type="number"
                                    classname="w-full md:w-44"
                                    showIcon={true}
                                    IconComponent={<div className="text-text02 text-xl">₽</div>}
                                    value={formData.monthlySalary}
                                    changeValue={(e) => handleInputChange('monthlySalary', e.target.value)}
                                    {...register('monthlySalary')}
                                    inputType="secondary"
                                />
                                <Input
                                    title={`${t("hr.daily")}`}
                                    type="number"
                                    classname="w-full md:w-44"
                                    value={formData.dailySalary}
                                    changeValue={(e) => handleInputChange('dailySalary', e.target.value)}
                                    {...register('dailySalary')}
                                    inputType="secondary"
                                    showIcon={true}
                                    IconComponent={<div className="text-text02 text-xl">₽</div>}
                                />
                                <Input
                                    title={`${t("marketing.per")}`}
                                    type={"number"}
                                    classname="w-full md:w-44"
                                    value={formData.percentageSalary}
                                    changeValue={(e) => handleInputChange('percentageSalary', e.target.value)}
                                    {...register('percentageSalary')}
                                    inputType="secondary"
                                    showIcon={true}
                                    IconComponent={<div className="text-text02 text-xl">%</div>}
                                />
                            </div>)}
                            {activeTab === "sch" && (<div className="space-y-4">
                                <div className="h-72 w-[457px] rounded-lg bg-background05 p-4 space-y-6">
                                    <div className="text-text01 font-semibold">{t("hr.auto")}</div>
                                    <div className="flex space-x-3 items-center">
                                        <div className="text-sm text-text01 font-semibold">{t("finance.sch")}</div>
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            classname="w-24"
                                            value={scheduleData.sch}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, sch: Number(e.target.value) }))}
                                        />
                                        <div className="text-sm text-text02">{t("finance.thr")}</div>
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            classname="w-24"
                                            value={scheduleData.repeat}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, repeat: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="flex space-x-3 items-center">
                                        <div className="text-sm text-text01 font-semibold">{t("finance.sta")}</div>
                                        {/* <div className="flex space-x-1 text-primary02_Hover items-center cursor-pointer">
                                            <div className="text-sm font-semibold">{t("finance.sel")}</div>
                                            <Icon icon="chevron-down" className="w-5 h-5" />
                                        </div> */}
                                        <DatePicker onChange={onChange} />
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        <div className="text-text01 font-semibold text-sm">{t("finance.open")}</div>
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            label="09 ч"
                                            classname="w-[68px]"
                                            value={scheduleData.openingHour}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, openingHour: Number(e.target.value) }))}
                                        />
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            label="00 м"
                                            classname="w-[68px]"
                                            value={scheduleData.openingMin}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, openingMin: Number(e.target.value) }))}
                                        />
                                        <div className="text-sm text-text02">-</div>
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            label="09 ч"
                                            classname="w-[68px]"
                                            value={scheduleData.closingHour}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, closingHour: Number(e.target.value) }))}
                                        />
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            label="00 м"
                                            classname="w-[68px]"
                                            value={scheduleData.closingMinute}
                                            changeValue={(e) => setScheduleData((prev) => ({ ...prev, closingMinute: Number(e.target.value) }))}
                                        />
                                    </div>
                                    {/* <div className="flex space-x-3 items-center">
                                        <div className="text-sm text-text01 font-semibold">{t("finance.ex")}</div>
                                        <Input
                                            type="number"
                                            inputType="secondary"
                                            classname="w-24"
                                        />
                                        <div className="text-sm text-text02">{t("finance.a")}</div>
                                    </div> */}
                                    <Button
                                        title={t("finance.fill")}
                                        handleClick={saveScheduleData}
                                    />
                                </div>
                                <div className="flex items-center justify-center w-full md:w-[800px] space-x-4">
                                    <button
                                        onClick={handlePrevYear}
                                        className="p-2 rounded-full bg-background05 text-text03"
                                    >
                                        <Icon icon="chevron-left" size={20} />
                                    </button>
                                    <div className="text-xl font-semibold">{year}</div>
                                    <button
                                        onClick={handleNextYear}
                                        className="p-2 rounded-full bg-background05 text-text03"
                                    >
                                        <Icon icon="chevron-right" size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row items-center space-x-4">
                                    {/* Left Arrow */}
                                    <button
                                        onClick={handlePrev}
                                        className="p-2 rounded-full bg-background05 text-text03 disabled:opacity-50"
                                        disabled={startIndex === 0}
                                    >
                                        <Icon icon="chevron-left" size={20} />
                                    </button>

                                    {/* Calendars */}
                                    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
                                        {months.slice(startIndex, startIndex + 3).map((month, index) => (
                                            <div key={index}>
                                                <div className="w-56 text-center font-semibold text-text01">
                                                    {month.name} {year}
                                                </div>
                                                <CalendarComponent
                                                    month={month.en}
                                                    year={year}
                                                    schedule={{
                                                        sch: scheduleData.sch,
                                                        repeat: scheduleData.repeat,
                                                        date: scheduleData.date
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Arrow */}
                                    <button
                                        onClick={handleNext}
                                        className="p-2 rounded-full bg-background05 text-text03 disabled:opacity-50"
                                        disabled={startIndex >= months.length - 3}
                                    >
                                        <Icon icon="chevron-right" size={20} />
                                    </button>
                                </div>
                            </div>)}
                        </div>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EmployeeProfile;