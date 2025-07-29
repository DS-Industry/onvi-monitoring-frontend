import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import { columnsEmployees } from "@/utils/OverFlowTableData";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useSWR, { mutate } from "swr";
import { getWorkers } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import NoOverhead from "@/assets/NoOverhead.png";
import NoDataUI from "@/components/ui/NoDataUI";
import Modal from "@/components/ui/Modal/Modal";
import Close from "@icons/close.svg?react";
import { addRole, getOrganization, getRoles, updateRole } from "@/services/api/organization";
import Button from "@/components/ui/Button/Button";
import useSWRMutation from "swr/mutation";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate, useToast } from "@/components/context/useContext";
import { useCity } from "@/hooks/useAuthStore";
import Input from "@/components/ui/Input/Input";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import DateInput from "@/components/ui/Input/DateInput";
import dayjs from "dayjs";

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

const ListOfEmployees: React.FC = () => {
    const { t } = useTranslation();
    const [selectedWorker, setSelectedWorker] = useState<string>("");
    const [openModal, setOpenModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleId, setRoleId] = useState(0);
    const [workerId, setWorkerId] = useState(0);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { showToast } = useToast();

    const { data: workerData, isLoading: loadingWorkers } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: rolesData } = useSWR([`get-role`], () => getRoles(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const city = useCity();

    const { data: organizationData } = useSWR([`get-org`], () => getOrganization({
        placementId: city
    }));

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];


    const { trigger: update, isMutating } = useSWRMutation(['update-role'], async () => updateRole({
        userId: workerId,
        roleId: roleId
    }));


    const roles: { name: string, value: number }[] = rolesData?.map((item) => ({
        name: item.name,
        value: item.id,
        render: (
            <div>
                <div>{item.name}</div>
                <div className="text-text02">Lorem ipsum dolor, sit amet consectetur</div>
            </div>
        )
    })) || [];

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

    const { trigger: addUserRole, isMutating: loadingRole } = useSWRMutation(['add-role'], async () => addRole({
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
        setButtonOn(false);
    };

    const onSubmit = async () => {
        try {
            const result = await addUserRole();
            if (result) {
                showToast(t("organizations.token"), "success");
                resetForm();
            }
        } catch (error) {
            console.error("Register error:", error);
            showToast(t("errors.other.registerError"), "error");
        }
    }

    const workers: {
        id: number;
        name: string;
        position: string;
        roleName: string;
        status: string;
        createdAt: string;
    }[] = workerData?.map((item) => ({
        id: item.id,
        name: `${item.surname} ${item.name} ${item.middlename}`,
        position: item.position,
        roleName: item.roleName,
        status: t(`tables.${item.status}`),
        createdAt: item.createAt
            ? new Date(item.createAt).toLocaleDateString("ru-RU")
            : "N/A"
    })) || [];

    const handleUpdate = (rowId: number) => {
        const worker = workers.find((work) => work.id === rowId)?.name || "";
        const workerRole = workers.find((role) => role.id === rowId)?.roleName || "";
        const roleNo = roles.find((role) => role.name === workerRole)?.value || 0;
        setWorkerId(rowId);
        setRoleId(roleNo);
        setSelectedWorker(worker)
        setOpenModal(true);
    }

    const handleUpdateRole = async () => {
        const result = await update();

        if (result) {
            mutate([`get-worker`]);
        }
    }

    return (
        <div>
            <Filter count={0} hideCity={true} hideDateTime={true} hideSearch={true}>
                <DropdownInput
                    title={t("roles.job")}
                    value={undefined}
                    options={[]}
                    classname="ml-2"
                />
                <DropdownInput
                    title={t("finance.status")}
                    value={undefined}
                    options={[]}
                    classname="ml-2"
                />
            </Filter>
            <div className="mt-5">
                <Notification
                    title={t("roles.access")}
                    message={t("roles.change")}
                    message2={t("roles.then")}
                    showEmp={true}
                />
                {loadingWorkers ?
                    <TableSkeleton columnCount={columnsEmployees.length} />
                    : workers.length > 0 ?
                        (<DynamicTable
                            data={workers}
                            columns={columnsEmployees}
                            onEdit={handleUpdate}
                        />) : (
                            <NoDataUI
                                title={t("organizations.noLegal")}
                                description={t("organizations.addLegal")}
                            >
                                <img src={NoOverhead} className="mx-auto" loading="lazy" alt="List" />
                            </NoDataUI>
                        )}
                {openModal && selectedWorker && (
                    <Modal isOpen={openModal} classname="sm:w-[552px] sm:h-[300px]">
                        <div className="flex items-center justify-between">
                            <div></div>
                            <Close onClick={() => setOpenModal(false)} className="cursor-pointer text-text01" />
                        </div>
                        <h2 className="text-2xl font-semibold text-text01 mb-4">{t("roles.role")}</h2>
                        <p className="text-primary02 text-sm">{selectedWorker}</p>
                        <DropdownInput
                            value={roleId}
                            options={roles}
                            onChange={(value) => setRoleId(value)}
                            classname="w-[300px] sm:w-[456px]"
                            renderOption={(option) => option.render || <span>{option.name}</span>}
                        />
                        <div className="flex justify-end space-x-4 mt-10">
                            <Button
                                title={t("organizations.cancel")}
                                type='outline'
                                handleClick={() => setOpenModal(false)}
                            />
                            <Button
                                title={t("organizations.save")}
                                // form={true}
                                isLoading={isMutating}
                                handleClick={handleUpdateRole}
                            />
                        </div>
                    </Modal>
                )}
                <Modal isOpen={isModalOpen} classname="sm:w-[552px]">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text01">{t("roles.create")}</h2>
                        <Close onClick={() => { setIsModalOpen(false); setButtonOn(false); }} className="cursor-pointer text-text01" />
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
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
                            value={formData.surname}
                            changeValue={(e) => handleInputChange('surname', e.target.value)}
                            {...register('surname')}
                        />
                        <Input
                            type="text"
                            title={t("profile.middlename")}
                            classname="w-80 sm:w-96"
                            value={formData.middlename}
                            changeValue={(e) => handleInputChange('middlename', e.target.value)}
                            {...register('middlename')}
                        />
                        <DateInput
                            title={`${t("register.date")}*`}
                            classname="w-40"
                            value={formData.birthday ? dayjs(formData.birthday) : null}
                            changeValue={(date) => handleInputChange('birthday', date ? date.format('YYYY-MM-DD') : "")}
                            error={!!errors.birthday}
                            {...register('birthday', {
                                required: 'Birthday is required'
                            })}
                            helperText={errors.birthday?.message || ''}
                        />
                        <Input
                            type="text"
                            title={`${t("register.phone")}*`}
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
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
                            classname="w-80 sm:w-96"
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
                            options={roles}
                            classname="w-80 sm:w-96"
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
                            title={`${t("roles.position")}*`}
                            options={[
                                { name: "Оператор", value: "Operator" }
                            ]}
                            classname="w-80 sm:w-96"
                            error={!!errors.position}
                            {...register('position', {
                                required: 'Position is required'
                            })}
                            value={formData.position}
                            onChange={(value) => handleInputChange('position', value)}
                            helperText={errors.position?.message || ''}
                        />
                        <div className="flex space-x-4">
                            <Button
                                title={t("organizations.cancel")}
                                type='outline'
                                handleClick={() => { resetForm(); setIsModalOpen(false); }}
                            />
                            <Button
                                title={t("roles.create")}
                                form={true}
                                isLoading={loadingRole}
                                handleClick={() => { }}
                            />
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    )
}

export default ListOfEmployees;