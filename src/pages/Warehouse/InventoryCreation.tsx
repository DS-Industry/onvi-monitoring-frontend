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
import { createNomenclature, deleteNomenclature, getCategory, getNomenclature, getSupplier, updateNomenclature } from "@/services/api/warehouse";
import { getOrganization } from "@/services/api/organization";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { useButtonCreate } from "@/components/context/useContext";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsInventory } from "@/utils/OverFlowTableData";
import Filter from "@/components/ui/Filter/Filter";
import { useCity } from "@/hooks/useAuthStore";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { Select } from "antd";
import { usePermissions } from "@/hooks/useAuthStore";
import { Can } from "@/permissions/Can";

enum PurposeType {
    SALE = "SALE",
    INTERNAL_USE = "INTERNAL_USE"
}

type INVENTORY = {
    name: string;
    sku: string;
    organizationId: number;
    categoryId: number;
    supplierId?: number;
    measurement: string;
    description?: string;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    purpose?: PurposeType;
}

const InventoryCreation: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editInventoryId, setEditInventoryId] = useState<number>(0);
    const [category, setCategory] = useState<number | string>(allCategoriesText); //Номенклатура фильтр категории 
    const [name, setName] = useState("");
    const [orgId, setOrgId] = useState<number | null>(null);
    const city = useCity();
    const userPermissions = usePermissions();

    const { data: inventoryData, isLoading: inventoryLoading } = useSWR(
        orgId ? [`get-inventory`, category, orgId] : null,
        () => {
            return getNomenclature(orgId!);
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        })

    const { data: categoryData } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: supplierData } = useSWR([`get-supplier`], () => getSupplier(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: organizationData } = useSWR(
        [`get-organization`],
        () => getOrganization({ placementId: city }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            onSuccess: (data) => {
                if (data && data.length > 0) {
                    setOrgId(data[0].id);
                }
            }
        });

    const inventories = inventoryData?.map((item) => item.props)
        ?.filter((item: { categoryId: number }) => category === allCategoriesText || item.categoryId === category)
        ?.filter((item: { name: string }) => item.name.toLowerCase().includes(name.toLowerCase()))
        ?.map((item) => item) || [];

    const categories: { name: string; value: number | string }[] = categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const categoryAllObj = {
        name: allCategoriesText,
        value: allCategoriesText,
    };

    categories.unshift(categoryAllObj);

    const inventoriesDisplay: { id: number; sku: string; name: string; categoryId: string | undefined; }[] = inventories.map((item) => ({ id: item.id, sku: item.sku, name: item.name, categoryId: categories.find((cat) => cat.value === item.categoryId)?.name }));

    const suppliers: { name: string; value: number; }[] = supplierData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues: INVENTORY = {
        name: '',
        sku: '',
        organizationId: 0,
        categoryId: 0,
        supplierId: undefined,
        measurement: '',
        description: undefined,
        weight: undefined,
        length: undefined,
        height: undefined,
        width: undefined,
        purpose: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createInventory, isMutating } = useSWRMutation(['create-inventory'], async () => createNomenclature({
        name: formData.name,
        sku: formData.sku,
        organizationId: formData.organizationId,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement,
        metaData: {
            description: formData.description,
            weight: formData.weight,
            height: formData.height,
            width: formData.width,
            length: formData.length,
            purpose: formData.purpose
        }
    }));

    const { trigger: updateInventory, isMutating: updatingInventory } = useSWRMutation(['update-inventory'], async () => updateNomenclature({
        nomenclatureId: editInventoryId,
        name: formData.name,
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        measurement: formData.measurement,
        metaData: {
            description: formData.description,
            weight: formData.weight,
            height: formData.height,
            width: formData.width,
            length: formData.length,
            purpose: formData.purpose
        }
    }));

    type FieldType = "organizationId" | "categoryId" | "supplierId" | "weight" | "height" | "length" | "width" | "name" | "sku" | "measurement" | "description" | "purpose";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['organizationId', 'categoryId', 'supplierId', 'weight', 'height', 'length', 'width'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleUpdate = (id: number) => {
        setIsEditMode(true);
        setButtonOn(true);
        const inventoryToEdit = inventories.find((inventory) => inventory.id === id);
        if (inventoryToEdit) {
            setFormData({
                name: inventoryToEdit.name,
                sku: inventoryToEdit.sku,
                organizationId: inventoryToEdit.organizationId,
                categoryId: inventoryToEdit.categoryId,
                measurement: inventoryToEdit.measurement,
                supplierId: inventoryToEdit.supplierId,
                description: inventoryToEdit.metaData ? inventoryToEdit.metaData.description : undefined,
                width: inventoryToEdit.metaData ? inventoryToEdit.metaData.width : undefined,
                length: inventoryToEdit.metaData ? inventoryToEdit.metaData.length : undefined,
                height: inventoryToEdit.metaData ? inventoryToEdit.metaData.height : undefined,
                purpose: inventoryToEdit.metaData ? inventoryToEdit.metaData.purpose : undefined,
                weight: inventoryToEdit.metaData ? inventoryToEdit.metaData.weight : undefined
            });
        }
    };

    const handleDelete = async () => {
        try {
            const result = await mutate(
                [`delete-nomenclature`, editInventoryId],
                () => deleteNomenclature(editInventoryId),
                false
            );

            if (result) {
                setButtonOn(!buttonOn);
                mutate([`get-inventory`, category, orgId]);
            }
        } catch (error) {
            console.error("Error deleting nomenclature:", error);
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditInventoryId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async () => {
        try {
            if (editInventoryId) {
                const result = await updateInventory();
                if (result) {
                    setCategory(result.props.categoryId)
                    mutate([`get-inventory`, result.props.categoryId, orgId]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createInventory();
                if (result) {
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
        setCategory(allCategoriesText);
    }

    return (
        <>
            <Filter count={inventoriesDisplay.length} hideDateTime={true} handleClear={handleClear} hideCity={true} search={name} setSearch={setName}>
                <div>
                    <div className="text-sm text-text02">{t("warehouse.organization")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={organizations.map((item) => ({ label: item.name, value: item.value }))}
                        value={orgId}
                        onChange={(value) => setOrgId(value)}
                    />
                </div>
                <div>
                    {/* здесь фильтр категории */}
                    <div className="text-sm text-text02">{t("warehouse.category")}</div>
                    <Select
                        className="w-full sm:w-80 h-10"
                        options={categories.map((item) => ({ label: item.name, value: item.value }))}
                        value={category}
                        onChange={(value) => setCategory(value)}
                    />
                </div>
            </Filter>
            {inventoryLoading ? (
                <TableSkeleton columnCount={columnsInventory.length} />
            ) : inventoriesDisplay.length > 0 ?
                <div className="mt-8">
                    <DynamicTable
                        data={inventoriesDisplay}
                        columns={columnsInventory}
                        onEdit={handleUpdate}
                    />
                </div> :
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("warehouse.nomenclature")}
                        description={""}
                    >
                        <img src={InventoryEmpty} className="mx-auto" loading="lazy" alt="Inventory" />
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
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("warehouse.about")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.description}
                        changeValue={(e) => handleInputChange('description', e.target.value)}
                        {...register('description')}
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
                        type={"number"}
                        classname="w-80"
                        value={formData.weight}
                        changeValue={(e) => handleInputChange('weight', e.target.value)}
                        {...register('weight')}
                    />
                    <Input
                        title={t("warehouse.sizeW")}
                        type={"number"}
                        classname="w-20"
                        value={formData.width}
                        changeValue={(e) => handleInputChange('width', e.target.value)}
                        {...register('width')}
                    />
                    <Input
                        title={t("warehouse.sizeG")}
                        type={"number"}
                        classname="w-20"
                        value={formData.length}
                        changeValue={(e) => handleInputChange('length', e.target.value)}
                        {...register('length')}
                    />
                    <Input
                        title={t("warehouse.sizeB")}
                        type={"number"}
                        classname="w-20"
                        value={formData.height}
                        changeValue={(e) => handleInputChange('height', e.target.value)}
                        {...register('height')}
                    />
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.purpose")}</div>
                    <div className="flex">
                        <div className="flex-1 flex flex-col">
                            <div className="flex">
                                <input
                                    type="radio"
                                    value={PurposeType.SALE}
                                    checked={formData.purpose === PurposeType.SALE}
                                    {...register("purpose")}
                                    onChange={(e) => { handleInputChange("purpose", e.target.value); }}
                                />
                                <div className="text-text02 ml-2">{t("warehouse.sale")}</div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex">
                                <input
                                    type="radio"
                                    value={PurposeType.INTERNAL_USE}
                                    checked={formData.purpose === PurposeType.INTERNAL_USE}
                                    {...register("purpose")}
                                    onChange={(e) => { handleInputChange("purpose", e.target.value); }}
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
                        <Can
                            requiredPermissions={[
                                { action: "manage", subject: "Warehouse" },
                                { action: "delete", subject: "Warehouse" },
                            ]}
                            userPermissions={userPermissions}
                        >
                            {(allowed) => allowed && isEditMode && (<Button
                                title={t("warehouse.deletePos")}
                                handleClick={handleDelete}
                                classname="bg-red-600 hover:bg-red-300"
                            />)}
                        </Can>
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