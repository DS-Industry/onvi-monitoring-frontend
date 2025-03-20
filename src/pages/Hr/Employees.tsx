import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import Filter from "@/components/ui/Filter/Filter";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import ProfilePhoto from "@/assets/ProfilePhoto.svg";
import Button from "@/components/ui/Button/Button";
import { useButtonCreate } from "@/components/context/useContext";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsEmployee } from "@/utils/OverFlowTableData";
import useFormHook from "@/hooks/useFormHook";

const Employees: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [notificationVisibleForm, setNotificationVisibleForm] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const tableData = [
        { name: "Steve", job: "Manager" }
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

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    type FieldType = "fullName" | "job" | "date" | "telephone" | "email" | "comment" | "monthly" | "daily" | "percent" | "floor" | "citizen" | "passport" | "tin" | "insurance";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ["monthly", "daily", "percent"];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
    };

    return (
        <div>
            <Filter count={0} children={undefined}>

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
                <div className="mt-8">
                    <OverflowTable
                        tableData={tableData}
                        columns={columnsEmployee}
                        nameUrl={"/hr/employees/profile"}
                    />
                </div>
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
                        value={formData.fullName}
                        changeValue={(e) => handleInputChange('fullName', e.target.value)}
                        error={!!errors.fullName}
                        {...register('fullName', { required: 'fullName is required' })}
                        helperText={errors.fullName?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("roles.job")}*`}
                        label={t("hr.selectPos")}
                        options={[
                            { name: t("hr.accountant"), value: "Accountant" },
                            { name: t("hr.washer"), value: "Washer" },
                            { name: t("hr.lineOperator"), value: "LineOperator" }
                        ]}
                        classname="w-64"
                        {...register('job', { required: 'job is required' })}
                        value={formData.job}
                        onChange={(value) => handleInputChange('job', value)}
                        error={!!errors.job}
                        helperText={errors.job?.message || ''}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("hr.date")}</div>
                        <Input
                            type={"date"}
                            classname="w-40"
                            value={formData.date}
                            changeValue={(e) => handleInputChange('date', e.target.value)}
                            {...register('date')}
                        />
                    </div>
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-80"
                        value={formData.telephone}
                        changeValue={(e) => handleInputChange('telephone', e.target.value)}
                        {...register('telephone', {
                            pattern: {
                                value: /^\+79\d{9}$/,
                                message: 'Phone number must start with +79 and be 11 digits long'
                            }
                        })}
                        error={!!errors.telephone}
                        helperText={errors.telephone?.message || ""}
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
                        value={formData.comment}
                        changeValue={(e) => handleInputChange('comment', e.target.value)}
                        {...register('comment')}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("profile.photo")}</div>
                        <div className="flex space-x-2 items-center">
                            <img src={ProfilePhoto} />
                            <div className="text-primary02 font-semibold">{t("hr.upload")}</div>
                        </div>
                    </div>
                    <div className="text-text01 font-semibold text-2xl">{t("hr.salary")}</div>
                    <Input
                        title={`${t("hr.month")}*`}
                        type={"number"}
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                        value={formData.monthly}
                        changeValue={(e) => handleInputChange('monthly', e.target.value)}
                        error={!!errors.monthly}
                        {...register('monthly', { required: 'monthly is required' })}
                        helperText={errors.monthly?.message || ''}
                    />
                    <Input
                        title={`${t("hr.daily")}*`}
                        type={"number"}
                        classname="w-44"
                        value={formData.daily}
                        changeValue={(e) => handleInputChange('daily', e.target.value)}
                        error={!!errors.daily}
                        {...register('daily', { required: 'daily is required' })}
                        helperText={errors.daily?.message || ''}
                    />
                    <Input
                        title={`${t("marketing.per")}*`}
                        type={"number"}
                        classname="w-44"
                        value={formData.percent}
                        changeValue={(e) => handleInputChange('percent', e.target.value)}
                        error={!!errors.percent}
                        {...register('percent', { required: 'percent is required' })}
                        helperText={errors.percent?.message || ''}
                    />
                    <div className="text-text01 font-semibold text-2xl">{t("hr.add")}</div>
                    <DropdownInput
                        title={`${t("marketing.floor")}`}
                        label={t("warehouse.notSel")}
                        options={[]}
                        classname="w-64"
                        {...register('floor')}
                        value={formData.floor}
                        onChange={(value) => handleInputChange('floor', value)}
                    />
                    <Input
                        type=""
                        title={t("hr.citi")}
                        label={t("hr.enterCiti")}
                        classname="w-80"
                        value={formData.citizen}
                        changeValue={(e) => handleInputChange('citizen', e.target.value)}
                        {...register('citizen')}
                    />
                    <MultilineInput
                        title={t("hr.pass")}
                        label={t("hr.enterPass")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.passport}
                        changeValue={(e) => handleInputChange('passport', e.target.value)}
                        {...register('passport')}
                    />
                    <Input
                        type=""
                        title={t("organizations.tin")}
                        label={t("hr.enterTin")}
                        classname="w-80"
                        value={formData.tin}
                        changeValue={(e) => handleInputChange('tin', e.target.value)}
                        {...register('tin')}
                    />
                    <Input
                        type=""
                        title={t("hr.insu")}
                        label={t("hr.enterInsu")}
                        classname="w-80"
                        value={formData.insurance}
                        changeValue={(e) => handleInputChange('insurance', e.target.value)}
                        {...register('insurance')}
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
                            // isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default Employees;