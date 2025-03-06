import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryEmpty from "@/assets/NoInventory.png"
import useSWR, { mutate } from "swr";
import { getPoses, getWorkers } from "@/services/api/equipment";
import { useCity, usePosType } from "@/hooks/useAuthStore";
import { createWarehouse, getWarehouses } from "@/services/api/warehouse";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsWarehouses } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import Filter from "@/components/ui/Filter/Filter";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import useSWRMutation from "swr/mutation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";

type WAREHOUSE = {
    name: string;
    location: string;
    managerId: number;
    posId: number;
}

const Warehouse: React.FC = () => {
    const { t } = useTranslation();
    const city = useCity();
    const posType = usePosType();
    const [posId, setPosId] = useState(posType);
    const { buttonOn, setButtonOn } = useButtonCreate();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: warehouseData, isLoading: warehouseLoading } = useSWR([`get-warehouse`, posId], () => getWarehouses(posType), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const warehouses = warehouseData?.map((item) => ({
        ...item.props,
        manager: workers.find((work) => work.value === item.props.managerId),
        posName: poses.find((pos) => pos.value === item.props.posId)?.name
    })) || [];

    const defaultValues: WAREHOUSE = {
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

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {

            const result = await createWare();
            if (result) {
                console.log('API Response:', result);
                mutate([`get-warehouse`, posId]);
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
            <Filter count={warehouses.length} hideCity={true} hideDateTime={true} hidePage={true} hideSearch={true}>
                <DropdownInput
                    title={t("marketing.carWash")}
                    value={posId}
                    options={poses}
                    onChange={(value) => setPosId(value)}
                />
            </Filter>
            {warehouseLoading ? (
                <TableSkeleton columnCount={columnsWarehouses.length} />
            ) : warehouses.length > 0 ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={warehouses}
                        columns={columnsWarehouses}
                    />
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("warehouse.noWare")}
                        description={""}
                    >
                        <img src={InventoryEmpty} className="mx-auto" />
                    </NoDataUI>
                </div>)}
            <DrawerCreate>
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