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

const Employees: React.FC = () => {
    const { t } = useTranslation();
    const [notificationVisible, setNotificationVisible] = useState(true);
    const [notificationVisibleForm, setNotificationVisibleForm] = useState(true);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const tableData = [
        { name: "Steve", job: "Manager" }
    ];

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
            <DrawerCreate>
                <form className="space-y-4">
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
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("roles.job")}*`}
                        label={t("hr.selectPos")}
                        value={undefined}
                        options={[]}
                        classname="w-64"
                    />
                    <div className="flex space-x-2">
                        <input type="checkbox" className="w-[18px] h-[18px]" />
                        <div className="text-text01">{t("hr.access")}</div>
                    </div>
                    <Input
                        title={`${t("login.password")}*`}
                        label={t("login.password")}
                        type={"password"}
                        classname="w-80"
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <Input
                        title={`${t("hr.confirm")}*`}
                        label={t("login.password")}
                        type={"password"}
                        classname="w-80"
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <div>
                        <div className="text-sm text-text02">{t("hr.date")}</div>
                        <Input
                            type={"date"}
                            classname="w-40"
                        // value={formData.name}
                        // changeValue={(e) => handleInputChange('name', e.target.value)}
                        // error={!!errors.name}
                        // {...register('name', { required: !isEditMode && 'Name is required' })}
                        // helperText={errors.name?.message || ''}
                        />
                    </div>
                    <Input
                        type=""
                        title={t("profile.telephone")}
                        label={t("warehouse.enterPhone")}
                        classname="w-80"
                    // value={formData.telephone}
                    // changeValue={(e) => handleInputChange('telephone', e.target.value)}
                    // {...register('telephone')}
                    />
                    <Input
                        type=""
                        title={"E-mail"}
                        label={t("marketing.enterEmail")}
                        classname="w-80"
                    // value={formData.email}
                    // changeValue={(e) => handleInputChange('email', e.target.value)}
                    // {...register('email')}
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("warehouse.about")}
                        classname="w-80"
                        inputType="secondary"
                        // value={formData.description}
                        changeValue={() => { }}
                    // {...register('description')}
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
                        type={"text"}
                        classname="w-44"
                        showIcon={true}
                        IconComponent={<div className="text-text02 text-xl">₽</div>}
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <Input
                        title={`${t("hr.daily")}*`}
                        type={"number"}
                        classname="w-44"
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <Input
                        title={`${t("marketing.per")}*`}
                        type={"number"}
                        classname="w-44"
                    // value={formData.name}
                    // changeValue={(e) => handleInputChange('name', e.target.value)}
                    // error={!!errors.name}
                    // {...register('name', { required: !isEditMode && 'Name is required' })}
                    // helperText={errors.name?.message || ''}
                    />
                    <div className="text-text01 font-semibold text-2xl">{t("hr.add")}</div>
                    <DropdownInput
                        title={`${t("marketing.floor")}`}
                        label={t("warehouse.notSel")}
                        value={undefined}
                        options={[]}
                        classname="w-64"
                    />
                    <Input
                        type=""
                        title={t("hr.citi")}
                        label={t("hr.enterCiti")}
                        classname="w-80"
                    // value={formData.telephone}
                    // changeValue={(e) => handleInputChange('telephone', e.target.value)}
                    // {...register('telephone')}
                    />
                    <MultilineInput
                        title={t("hr.pass")}
                        label={t("hr.enterPass")}
                        classname="w-80"
                        inputType="secondary"
                        // value={formData.description}
                        changeValue={() => { }}
                    // {...register('description')}
                    />
                    <Input
                        type=""
                        title={t("organizations.tin")}
                        label={t("hr.enterTin")}
                        classname="w-80"
                    // value={formData.telephone}
                    // changeValue={(e) => handleInputChange('telephone', e.target.value)}
                    // {...register('telephone')}
                    />
                    <Input
                        type=""
                        title={t("hr.insu")}
                        label={t("hr.enterInsu")}
                        classname="w-80"
                    // value={formData.telephone}
                    // changeValue={(e) => handleInputChange('telephone', e.target.value)}
                    // {...register('telephone')}
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type="outline"
                            handleClick={() => {
                                setButtonOn(!buttonOn);
                                // resetForm();
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