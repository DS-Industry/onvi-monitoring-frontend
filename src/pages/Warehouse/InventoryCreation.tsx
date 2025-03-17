import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryEmpty from "@/assets/NoInventory.png"
import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useSWR, { mutate } from "swr";
import { createNomenclature, getCategory, getNomenclature, getSupplier, updateNomenclature } from "@/services/api/warehouse";
import { getOrganization } from "@/services/api/organization";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { useButtonCreate } from "@/components/context/useContext";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsInventory } from "@/utils/OverFlowTableData";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import Filter from "@/components/ui/Filter/Filter";
import { useCity } from "@/hooks/useAuthStore";

type INVENTORY = {
    name: string;
    sku: string;
    organizationId: number;
    categoryId: number;
    supplierId?: number;
    measurement: string;
}

const InventoryCreation: React.FC = () => {
    const { t } = useTranslation();
    const [forSale, setForSale] = useState(false);
    const [writeOff, setWriteOff] = useState(false);
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editInventoryId, setEditInventoryId] = useState<number>(0);
    const [category, setCategory] = useState(0);
    const [name, setName] = useState("");
    const [orgId, setOrgId] = useState(1);
    const city = useCity();

    const { data: inventoryData, isLoading: inventoryLoading } = useSWR([`get-inventory`, category, orgId], () => getNomenclature(orgId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: supplierData } = useSWR([`get-supplier`], () => getSupplier(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const inventories = inventoryData?.map((item) => item.props)
        ?.filter((item: { categoryId: number }) => category === 0 || item.categoryId === category)
        ?.filter((item: { name: string }) => item.name.toLowerCase().includes(name.toLowerCase()))
        ?.map((item) => item) || [];

    const categories: { name: string; value: number; }[] = categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const inventoriesDisplay: { id: number; sku: string; name: string; categoryId: string | undefined; }[] = inventories.map((item) => ({ id: item.id,sku: item.sku, name: item.name, categoryId: categories.find((cat) => cat.value === item.categoryId)?.name }));

    const suppliers: { name: string; value: number; }[] = supplierData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues: INVENTORY = {
        name: '',
        sku: '',
        organizationId: 0,
        categoryId: 0,
        supplierId: undefined,
        measurement: ''
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createInventory, isMutating } = useSWRMutation(['create-inventory'], async () => createNomenclature({
        name: formData.name,
        sku: formData.sku,
        organizationId: formData.organizationId,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement
    }));

    const { trigger: updateInventory, isMutating: updatingInventory } = useSWRMutation(['update-inventory'], async () => updateNomenclature({
        nomenclatureId: editInventoryId,
        name: formData.name,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement
    }));

    type FieldType = "name" | "sku" | "organizationId" | "categoryId" | "supplierId" | "measurement";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['organizationId', 'categoryId', 'supplierId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleUpdate = (id: number) => {
        setEditInventoryId(id);
        setIsEditMode(true);
        setButtonOn(true);
        console.log(id);
        console.log(isEditMode);
        const inventoryToEdit = inventories.find((inventory) => inventory.id === id);
        console.log(inventoryToEdit);
        if (inventoryToEdit) {
            setFormData({
                name: inventoryToEdit.name,
                sku: inventoryToEdit.sku,
                organizationId: inventoryToEdit.organizationId,
                categoryId: inventoryToEdit.categoryId,
                measurement: inventoryToEdit.measurement,
                supplierId: inventoryToEdit.supplierId
            });
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditInventoryId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {
            if (editInventoryId) {
                const result = await updateInventory();
                console.log(result);
                if (result) {
                    console.log(result);
                    setCategory(result.props.categoryId)
                    mutate([`get-inventory`, result.props.categoryId, orgId]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createInventory();
                if (result) {
                    console.log('API Response:', result);
                    setCategory(result.props.categoryId)
                    mutate([`get-inventory`, result.props.categoryId, orgId]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const handleClear = () => {
        setCategory(0);
    }

    return (
        <>
            <Filter count={inventoriesDisplay.length} hideDateTime={true} handleClear={handleClear} hideCity={true} search={name} setSearch={setName}>
                <DropdownInput
                    title={t("warehouse.organization")}
                    value={orgId}
                    options={organizations}
                    onChange={(value) => setOrgId(value)}
                    classname="ml-2"
                />
                <DropdownInput
                    title={t("warehouse.category")}
                    value={category}
                    classname="ml-2"
                    options={categories}
                    onChange={(value) => setCategory(value)}
                />
            </Filter>
            {inventoryLoading ? (
                <TableSkeleton columnCount={columnsInventory.length} />
            ) : inventoriesDisplay.length > 0 ?
                <div className="mt-8">
                    <OverflowTable
                        tableData={inventoriesDisplay}
                        columns={columnsInventory}
                        isUpdateLeft={true}
                        onUpdate={handleUpdate}
                    />
                </div> :
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("warehouse.nomenclature")}
                        description={""}
                    >
                        <img src={InventoryEmpty} className="mx-auto" />
                    </NoDataUI>
                </div>
            }
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{isEditMode ? t("warehouse.edit") : t("warehouse.add")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.basic")}</div>
                    <Input
                        title={t("profile.name")}
                        label={t("warehouse.enter")}
                        type={"text"}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: !isEditMode && 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("warehouse.category")} *`}
                        label={categories.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={categories}
                        classname="w-64"
                        {...register('categoryId', {
                            required: !isEditMode && 'Category Id is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Category ID is required"
                        })}
                        value={formData.categoryId}
                        onChange={(value) => handleInputChange('categoryId', value)}
                        error={!!errors.categoryId}
                        helperText={errors.categoryId?.message}
                    />
                    <DropdownInput
                        title={`${t("routes.suppliers")}`}
                        label={suppliers.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={suppliers}
                        classname="w-64"
                        {...register('supplierId')}
                        value={formData.supplierId}
                        onChange={(value) => handleInputChange('supplierId', value)}
                    />
                    <DropdownInput
                        title={`${t("warehouse.organization")} *`}
                        label={organizations.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={organizations}
                        classname="w-64"
                        {...register('organizationId', {
                            required: !isEditMode && 'Organization Id is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Organization ID is required"
                        })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                        isDisabled={isEditMode}
                    />
                    <DropdownInput
                        title={`${t("warehouse.unit")} *`}
                        label={t("warehouse.notSel")}
                        options={[
                            { name: t("tables.PIECE"), value: "PIECE" },
                            { name: t("tables.KILOGRAM"), value: "KILOGRAM" },
                            { name: t("tables.LITER"), value: "LITER" },
                            { name: t("tables.METER"), value: "METER" }
                        ]}
                        classname="w-64"
                        {...register('measurement', {
                            required: !isEditMode && 'Measurement is required',
                        })}
                        value={formData.measurement}
                        onChange={(value) => handleInputChange('measurement', value)}
                        error={!!errors.measurement}
                        helperText={errors.measurement?.message}
                    />
                    <Input
                        title={`${t("warehouse.article")} *`}
                        label={isEditMode ? "" : t("warehouse.enterItem")}
                        type={"text"}
                        classname="w-80"
                        value={formData.sku}
                        changeValue={(e) => handleInputChange('sku', e.target.value)}
                        error={!!errors.sku}
                        {...register('sku', { required: !isEditMode && 'sku is required' })}
                        helperText={errors.sku?.message || ''}
                        disabled={isEditMode}
                    />
                    <Input
                        title={t("warehouse.vat")}
                        type={"number"}
                        classname="w-20"
                        changeValue={() => { }}
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("warehouse.about")}
                        classname="w-80"
                        inputType="secondary"
                        changeValue={() => { }}
                    />
                    {/* <div>
                        <div>{t("warehouse.productPh")}</div>
                        <div>{t("pos.maxNumber")}</div>
                        <Button
                            form={false}
                            iconPlus={true}
                            type="outline"
                            title={t("pos.download")}
                        />
                    </div> */}
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.product")}</div>
                    <Input
                        title={t("warehouse.weight")}
                        label={t("warehouse.enterWgt")}
                        type={"text"}
                        classname="w-80"
                        changeValue={() => { }}
                    />
                    <Input
                        title={t("warehouse.sizeW")}
                        type={"number"}
                        classname="w-20"
                        changeValue={() => { }}
                    />
                    <Input
                        title={t("warehouse.sizeG")}
                        type={"number"}
                        classname="w-20"
                        changeValue={() => { }}
                    />
                    <Input
                        title={t("warehouse.sizeB")}
                        type={"number"}
                        classname="w-20"
                        changeValue={() => { }}
                    />
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.purpose")}</div>
                    <div className="flex">
                        <div className="flex-1 flex flex-col">
                            <div className="flex">
                                <input
                                    type="checkbox"
                                    checked={forSale}
                                    onChange={(e) => {
                                        setForSale(e.target.checked);
                                    }}
                                />
                                <div className="text-text02 ml-2">{t("warehouse.sale")}</div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex">
                                <input
                                    type="checkbox"
                                    checked={writeOff}
                                    onChange={(e) => {
                                        setWriteOff(e.target.checked);
                                    }}
                                />
                                <div className="text-text02 ml-2">{t("warehouse.write")}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("warehouse.deletePos")}
                            form={true}
                            handleClick={() => { }}
                            classname="bg-red-600 hover:bg-red-300"
                        />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isEditMode ? updatingInventory : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default InventoryCreation;