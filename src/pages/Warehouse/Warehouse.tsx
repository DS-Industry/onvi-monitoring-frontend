import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import { getPoses, getWorkers } from "@/services/api/equipment";
import { createWarehouse, getWarehouses } from "@/services/api/warehouse";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate, useToast } from "@/components/context/useContext";
import useSWRMutation from "swr/mutation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { Table } from "antd";
import { useColumnSelector } from "@/hooks/useTableColumnSelector";
import { ColumnsType } from "antd/es/table";
import ColumnSelector from "@/components/ui/Table/ColumnSelector";
import GeneralFilters from "@/components/ui/Filter/GeneralFilters";
import { useSearchParams } from "react-router-dom";

type Warehouse = {
    name: string;
    location: string;
    managerId: number;
    posId: number;
}

const Warehouse: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const [searchParams] = useSearchParams();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const { showToast } = useToast();

    const posId = searchParams.get("posId") || "*";
    const placementId = searchParams.get("city") || "*";

    const filterParams = useMemo(
        () => ({
            posId,
            placementId
        }),
        [posId, placementId]
    );

    const swrKey = useMemo(() => {
        return [
            "get-warehouses",
            filterParams.posId,
            filterParams.placementId
        ];
    }, [filterParams]);

    const { data: posData } = useSWR([`get-pos`, placementId], () => getPoses({ placementId: placementId }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData, isLoading: warehouseLoading } = useSWR(swrKey, () => getWarehouses({
        posId: posId,
        placementId: placementId
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number | string; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const posesAllObj = {
        name: allCategoriesText,
        value: "*",
    };

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const warehouses = warehouseData?.map((item) => ({
        ...item.props,
        manager: workers.find((work) => work.value === item.props.managerId)?.name,
        posName: poses.find((pos) => pos.value === item.props.posId)?.name
    })) || [];

    const defaultValues = {
        name: '',
        location: '',
        managerId: 0,
        posId: 0
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createWare, isMutating } = useSWRMutation(['create-warehouse'], async () => createWarehouse({
        name: formData.name,
        location: formData.location,
        managerId: formData.managerId,
        posId: formData.posId
    }));

    type FieldType = "name" | "location" | "managerId" | "posId";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['managerId', 'posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        reset();
        setButtonOn(!buttonOn);
    };

    const onSubmit = async () => {
        try {

            const result = await createWare();
            if (result) {
                mutate(swrKey);
                resetForm();
            } else {
                throw new Error('Invalid response from API');
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
            showToast(t("errors.other.errorDuringFormSubmission"), "error");
        }
    };

    const columnsWarehouses: ColumnsType<Warehouse> = [
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Расположение",
            dataIndex: "location",
            key: "location"
        },
        {
            title: "Менеджер",
            dataIndex: "manager",
            key: "manager"
        },
        {
            title: "Автомойка/ Филиал",
            dataIndex: "posName",
            key: "posName"
        }
    ]

    const {
        checkedList,
        setCheckedList,
        options: columnOptions,
        visibleColumns,
    } = useColumnSelector(columnsWarehouses, "plan-fact-columns");

    return (
        <div>
            <GeneralFilters
                poses={[...poses, posesAllObj]}
                count={warehouses.length}
                hideSearch={true}
                hideDateAndTime={true}
            />
            <div className="mt-8">
                <ColumnSelector
                    checkedList={checkedList}
                    options={columnOptions}
                    onChange={setCheckedList}
                />
                <Table
                    rowKey="posId"
                    dataSource={warehouses}
                    columns={visibleColumns}
                    loading={warehouseLoading}
                    pagination={false}
                />
            </div>
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("warehouse.ware")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <Input
                        title={t("profile.name")}
                        label={t("warehouse.enter")}
                        type={"text"}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <Input
                        title={`${t("pos.location")} *`}
                        label={t("warehouse.enter")}
                        type={"text"}
                        classname="w-80"
                        value={formData.location}
                        changeValue={(e) => handleInputChange('location', e.target.value)}
                        error={!!errors.location}
                        {...register('location', { required: 'Location is required' })}
                        helperText={errors.location?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("warehouse.manager")} *`}
                        label={t("warehouse.notSel")}
                        options={workers}
                        classname="w-64"
                        {...register('managerId', {
                            required: 'Category Id is required',
                            validate: (value) =>
                                (value !== 0) || "Category ID is required"
                        })}
                        value={formData.managerId}
                        onChange={(value) => handleInputChange('managerId', value)}
                        error={!!errors.managerId}
                        helperText={errors.managerId?.message}
                    />
                    <DropdownInput
                        title={`${t("marketing.carWash")} *`}
                        label={t("warehouse.notSel")}
                        options={poses}
                        classname="w-64"
                        {...register('posId', {
                            required: 'Category Id is required',
                            validate: (value) =>
                                (value !== 0) || "Category ID is required"
                        })}
                        value={formData.posId}
                        onChange={(value) => handleInputChange('posId', value)}
                        error={!!errors.posId}
                        helperText={errors.posId?.message}
                    />
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("organizations.save")}
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

export default Warehouse;