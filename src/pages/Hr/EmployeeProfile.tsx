import SearchInput from "@/components/ui/Input/SearchInput";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from 'feather-icons-react';
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import CalendarComponent from "@/components/ui/Calendar/CalendarComponent";
import { useButtonCreate } from "@/components/context/useContext";
import type { DatePickerProps } from 'antd';
import { DatePicker } from 'antd';

const EmployeeProfile: React.FC = () => {
    const { t } = useTranslation();
    const [searchEmp, setSearchEmp] = useState("");
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const { buttonOn } = useButtonCreate();

    const getInitials = (fullName: string) => {
        const words = fullName.trim().split(" ");

        if (words.length < 2) return "";

        return words.slice(0, 2).map(word => word[0].toUpperCase()).join("");
    }

    const employeeDetails = [
        { fullName: "Иванова Екатерина Валерьевна", job: t("hr.accountant") },
        { fullName: "Сидоров Егор Андреевич", job: t("hr.washer") },
        { fullName: "Попов Антон Владимирович", job: t("hr.washer") },
        { fullName: "Антонов Антон Антонович", job: t("hr.washer") },
        { fullName: "Иванов Константин Петрович", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") },
        { fullName: "Семенов Семен Аркадьевич ич", job: t("hr.lineOperator") }
    ].filter((emp) => emp.fullName.toLowerCase().includes(searchEmp.toLowerCase()));

    const tabs = [
        { id: 'info', name: t("hr.info") },
        { id: 'addi', name: t("hr.addi") },
        { id: 'salary', name: t("hr.salary") },
        { id: 'sch', name: t("finance.sch") }
    ];

    const defaultValues = {
        fullName: "",
        job: "",
        date: "",
        telephone: "",
        email: "",
        comment: "",
        monthly: 0,
        daily: 0,
        percent: 0,
        floor: "",
        citizen: "",
        passport: "",
        tin: "",
        insurance: ""
    }

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
    };

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    type FieldType = "fullName" | "job" | "date" | "telephone" | "email" | "comment" | "monthly" | "daily" | "percent" | "floor" | "citizen" | "passport" | "tin" | "insurance";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["monthly", "daily", "percent"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
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
                        {employeeDetails.map((emp) => (
                            <div className="flex rounded-lg hover:bg-background05 p-2.5 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">
                                    {getInitials(emp.fullName)}
                                </div>
                                <div>
                                    <div className="text-text01 font-semibold max-w-44 truncate overflow-hidden whitespace-nowrap">{emp.fullName}</div>
                                    <div className="text-text02 text-sm">{emp.job}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        title={t("routes.addE")}
                        iconPlus={true}
                        type="outline"
                        classname="w-full"
                    />
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
                        <div className="mt-4">
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-text02">{t("finance.status")}</div>
                                        <div className="rounded-2xl py-[2px] px-2 flex items-center gap-2 w-36 text-[#00A355] bg-[#D1FFEA]">
                                            <span className="w-2 h-2 bg-[#00A355] rounded-full"></span>
                                            {t("tables.ACTIVE")}
                                        </div>
                                    </div>
                                    <Input
                                        title={`${t("hr.full")}`}
                                        label={t("hr.enter")}
                                        type={"text"}
                                        classname="w-full md:w-80"
                                        value={formData.fullName}
                                        changeValue={(e) => handleInputChange('fullName', e.target.value)}
                                        {...register('fullName')}
                                        inputType="secondary"
                                    />
                                    <DropdownInput
                                        title={`${t("roles.job")}`}
                                        label={t("hr.selectPos")}
                                        options={[
                                            { name: t("hr.accountant"), value: "Accountant" },
                                            { name: t("hr.washer"), value: "Washer" },
                                            { name: t("hr.lineOperator"), value: "LineOperator" }
                                        ]}
                                        classname="w-full md:w-64"
                                        {...register('job')}
                                        value={formData.job}
                                        onChange={(value) => handleInputChange('job', value)}
                                        inputType="secondary"
                                    />
                                    <div>
                                        <div className="text-sm text-text02">{t("hr.date")}</div>
                                        <Input
                                            type={"date"}
                                            classname="w-full md:w-40"
                                            value={formData.date}
                                            changeValue={(e) => handleInputChange('date', e.target.value)}
                                            {...register('date')}
                                            inputType="secondary"
                                        />
                                    </div>
                                    <Input
                                        type=""
                                        title={t("profile.telephone")}
                                        label={t("warehouse.enterPhone")}
                                        classname="w-full md:w-80"
                                        value={formData.telephone}
                                        changeValue={(e) => handleInputChange('telephone', e.target.value)}
                                        {...register('telephone')}
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
                                        value={formData.comment}
                                        changeValue={(e) => handleInputChange('comment', e.target.value)}
                                        {...register('comment')}
                                    />
                                    <div>
                                        <div className="text-sm text-text02">{t("profile.photo")}</div>
                                        <div className="w-10 h-10 rounded-full bg-background03 flex items-center justify-center text-xs text-text01">FN</div>
                                    </div>
                                </div>
                            )}
                            {activeTab === "addi" && (<div className="space-y-4">
                                <Input
                                    type=""
                                    title={t("hr.citi")}
                                    label={t("hr.enterCiti")}
                                    classname="w-full md:w-80"
                                    value={formData.citizen}
                                    changeValue={(e) => handleInputChange('citizen', e.target.value)}
                                    {...register('citizen')}
                                    inputType="secondary"
                                />
                                <MultilineInput
                                    title={t("hr.pass")}
                                    label={t("hr.enterPass")}
                                    classname="w-full md:w-80"
                                    inputType="secondary"
                                    value={formData.passport}
                                    changeValue={(e) => handleInputChange('passport', e.target.value)}
                                    {...register('passport')}
                                />
                                <Input
                                    type=""
                                    title={t("organizations.tin")}
                                    label={t("hr.enterTin")}
                                    classname="w-full md:w-80"
                                    value={formData.tin}
                                    changeValue={(e) => handleInputChange('tin', e.target.value)}
                                    {...register('tin')}
                                    inputType="secondary"
                                />
                                <Input
                                    type=""
                                    title={t("hr.insu")}
                                    label={t("hr.enterInsu")}
                                    classname="w-full md:w-80"
                                    value={formData.insurance}
                                    changeValue={(e) => handleInputChange('insurance', e.target.value)}
                                    {...register('insurance')}
                                    inputType="secondary"
                                />
                            </div>)}
                            {activeTab === "salary" && (<div className="space-y-4">
                                <Input
                                    title={`${t("hr.month")}`}
                                    type={"number"}
                                    classname="w-full md:w-44"
                                    showIcon={true}
                                    IconComponent={<div className="text-text02 text-xl">₽</div>}
                                    value={formData.monthly}
                                    changeValue={(e) => handleInputChange('monthly', e.target.value)}
                                    {...register('monthly')}
                                    inputType="secondary"
                                />
                                <Input
                                    title={`${t("hr.daily")}`}
                                    type={"number"}
                                    classname="w-full md:w-44"
                                    value={formData.daily}
                                    changeValue={(e) => handleInputChange('daily', e.target.value)}
                                    {...register('daily')}
                                    inputType="secondary"
                                    showIcon={true}
                                    IconComponent={<div className="text-text02 text-xl">₽</div>}
                                />
                                <Input
                                    title={`${t("marketing.per")}`}
                                    type={"number"}
                                    classname="w-full md:w-44"
                                    value={formData.percent}
                                    changeValue={(e) => handleInputChange('percent', e.target.value)}
                                    {...register('percent')}
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EmployeeProfile;