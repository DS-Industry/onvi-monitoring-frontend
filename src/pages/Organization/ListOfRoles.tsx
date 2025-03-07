import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsRoles } from "@/utils/OverFlowTableData";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import useSWR from "swr";
import { addRole, getOrganization, getRoles } from "@/services/api/organization";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useButtonCreate } from "@/components/context/useContext";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import useFormHook from "@/hooks/useFormHook";
import { useCity } from "@/hooks/useAuthStore";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWRMutation from "swr/mutation";

type Role = {
    name: string;
    surname?: string;
    middlename?: string;
    birthday: string;
    phone: string;
    email: string;
    organizationId: number;
    roleId: number;
    position: string;
}

const ListOfRoles: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn } = useButtonCreate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: rolesData, isLoading: loadingRoles } = useSWR([`get-role`], () => getRoles(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const city = useCity();

    const { data: organizationData } = useSWR([`get-org`], () => getOrganization({
        placementId: city
    }));

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const rolesArray: { name: string; value: number; }[] = rolesData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const roles = rolesData || [];

    useEffect(() => {
        if (buttonOn)
            setIsModalOpen(true);
    }, [buttonOn]);

    const defaultValues: Role = {
        name: "",
        surname: "",
        middlename: "",
        birthday: "",
        phone: "",
        email: "",
        organizationId: 0,
        roleId: 0,
        position: ""
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: addUserRole, isMutating } = useSWRMutation(['add-role'], async () => addRole({
        name: formData.name,
        middlename: formData.middlename,
        surname: formData.surname,
        birthday: new Date(`${formData.birthday}T13:24:45.742+03:00`),
        phone: formData.phone,
        email: formData.email,
        organizationId: formData.organizationId,
        roleId: formData.roleId,
        position: formData.position
    })
    );

    type FieldType = "name" | "surname" | "middlename" | "birthday" | "phone" | "email" | "organizationId" | "roleId" | "position";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['organizationId', 'categoryId', 'supplierId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setIsModalOpen(false);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Form data:", data);
        try {
            const result = await addUserRole();
            if (result) {
                console.log(result);
            }
        } catch (error) {
            console.log("Register error:", error);
        }
    }

    return (
        <div>
            <Notification
                title={t("roles.access")}
                message={t("roles.the")}
                showEmp={true}
            />
            {loadingRoles ?
                <TableSkeleton columnCount={columnsRoles.length} />
                : <OverflowTable
                    tableData={roles}
                    columns={columnsRoles}
                />}
            <Modal isOpen={isModalOpen}>
                <div className="flex flex-row items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text01">{t("roles.create")}</h2>
                    <Close onClick={() => setIsModalOpen(false)} className="cursor-pointer text-text01" />
                </div>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-5 flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        type="text"
                        title={t("roles.name")}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', {
                            required: 'Name is required'
                        })}
                        helperText={errors.name?.message || ''}
                    />
                    <Input
                        type="text"
                        title={t("profile.surname")}
                        classname="w-80"
                        value={formData.surname}
                        changeValue={(e) => handleInputChange('surname', e.target.value)}
                        {...register('surname')}
                    />
                    <Input
                        type="text"
                        title={t("profile.middlename")}
                        classname="w-80"
                        value={formData.middlename}
                        changeValue={(e) => handleInputChange('middlename', e.target.value)}
                        {...register('middlename')}
                    />
                    <Input
                        type="date"
                        title={`${t("register.date")}*`}
                        classname="w-40"
                        value={formData.birthday}
                        changeValue={(e) => handleInputChange('birthday', e.target.value)}
                        error={!!errors.birthday}
                        {...register('birthday', {
                            required: 'Birthday is required'
                        })}
                        helperText={errors.birthday?.message || ''}
                    />
                    <Input
                        type="text"
                        title={`${t("register.phone")}*`}
                        classname="w-80"
                        value={formData.phone}
                        changeValue={(e) => handleInputChange('phone', e.target.value)}
                        error={!!errors.phone}
                        {...register('phone', {
                            required: 'Phone is required',
                            pattern: {
                                value: /^\+79\d{9}$/,
                                message: 'Phone number must start with +79 and be 11 digits long'
                            }
                        })}
                        helperText={errors.phone?.message || ''}
                    />
                    <Input
                        type="text"
                        title={"Email*"}
                        classname="w-80"
                        value={formData.email}
                        changeValue={(e) => handleInputChange('email', e.target.value)}
                        error={!!errors.email}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Invalid email format'
                            }
                        })}
                        helperText={errors.email?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("warehouse.organization")}*`}
                        label={t("warehouse.notSel")}
                        options={organizations}
                        classname="w-80"
                        {...register('organizationId', {
                            required: 'Organization Id is required',
                            validate: (value) =>
                                (value !== 0) || "Category ID is required"
                        })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                    />
                    <DropdownInput
                        title={`${t("roles.rol")}*`}
                        label={t("warehouse.notSel")}
                        options={rolesArray}
                        classname="w-80"
                        {...register('roleId', {
                            required: 'Role Id is required',
                            validate: (value) =>
                                (value !== 0) || "Category ID is required"
                        })}
                        value={formData.roleId}
                        onChange={(value) => handleInputChange('roleId', value)}
                        error={!!errors.roleId}
                        helperText={errors.roleId?.message}
                    />
                    <DropdownInput
                        type="text"
                        title={`${t("roles.position")}*`}
                        options={[
                            { name: "Оператор", value: "Operator" }
                        ]}
                        classname="w-80"
                        error={!!errors.position}
                        {...register('position', {
                            required: 'Position is required'
                        })}
                        value={formData.position}
                        onChange={(value) => handleInputChange('position', value)}
                        helperText={errors.position?.message || ''}
                    />
                    {/* <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("roles.desc")}
                        classname="w-96"
                        changeValue={() => { }}
                    />
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <div className="text-text01">{t("roles.acc")}</div>
                    </div>
                    <div className="flex">
                        <div className="text-text01 font-semibold text-lg">{t("routes.accessRights")}</div>
                        <span className="text-errorFill">*</span>
                    </div> */}
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => { resetForm(); setIsModalOpen(false); }}
                        />
                        <Button
                            title={t("roles.create")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ListOfRoles;