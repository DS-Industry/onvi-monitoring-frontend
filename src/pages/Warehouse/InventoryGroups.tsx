import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryEmpty from "@/assets/NoInventory.png"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import useSWR, { mutate } from "swr";
import { createCategory, getCategory, updateCategory } from "@/services/api/warehouse";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { useButtonCreate } from "@/components/context/useContext";
import TreeTable from "@/components/ui/Table/TreeTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsCategory } from "@/utils/OverFlowTableData";

type TreeData = {
    id: number;
    name: string;
    description?: string;
    children?: TreeData[];
    isExpanded?: boolean;
    [key: string]: any;
};

type CATEGORY = {
    name: string;
    description?: string;
    ownerCategoryId?: number;
}

const buildTree = (data: any[]): TreeData[] => {
    const map: Record<number, TreeData> = {};
    const roots: TreeData[] = [];

    data.forEach((item) => {
        map[item.id] = { ...item, children: [] };
    });

    data.forEach((item) => {
        if (item.ownerCategoryId === null) {
            roots.push(map[item.id]);
        } else if (map[item.ownerCategoryId]) {
            map[item.ownerCategoryId]?.children?.push(map[item.id]);
        }
    });

    return roots;
};


const InventoryGroups: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editInventoryId, setEditInventoryId] = useState<number>(0);

    const { data: categoryData, isLoading: loadingCategory } = useSWR([`get-category`], () => getCategory(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const categories: { name: string; value: number; }[] = categoryData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const category = categoryData?.map((cat) => cat.props) || [];

    const defaultValues: CATEGORY = {
        name: '',
        description: '',
        ownerCategoryId: undefined
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createCat, isMutating } = useSWRMutation(['create-inventory'], async () => createCategory({
        name: formData.name,
        description: formData.description,
        ownerCategoryId: formData.ownerCategoryId
    }));

    const { trigger: updateCat, isMutating: updatingCat } = useSWRMutation(['update-inventory'], async () => updateCategory({
        name: formData.name,
        description: formData.description,
    }, editInventoryId));

    type FieldType = "name" | "description" | "ownerCategoryId";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['ownerCategoryId'];
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
        const inventoryToEdit = category.find((inventory) => inventory.id === id);
        console.log(inventoryToEdit);
        if (inventoryToEdit) {
            setFormData({
                name: inventoryToEdit.name,
                description: inventoryToEdit.description,
                ownerCategoryId: inventoryToEdit.ownerCategoryId
            });
        }
        console.log("The id to edit: ", id);
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
                const result = await updateCat();
                console.log(result);
                if (result) {
                    console.log(result);
                    mutate([`get-category`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createCat();
                if (result) {
                    console.log('API Response:', result);
                    mutate([`get-category`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const treeData = buildTree(category);

    return (
        <>
            {loadingCategory ? (
                <TableSkeleton columnCount={columnsCategory.length} />
            ) : treeData.length > 0 ?
                <div className="mt-8">
                    <TreeTable
                        treeData={treeData}
                        columns={columnsCategory}
                        isUpdate={true}
                        onUpdate={handleUpdate}
                    />
                </div> :
                <NoDataUI
                    title={t("warehouse.nomenclature")}
                    description={""}
                >
                    <img src={InventoryEmpty} className="mx-auto" />
                </NoDataUI>
            }
            <DrawerCreate classname="w-[440px]">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("warehouse.groupCreate")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
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
                        title={`${t("warehouse.included")}`}
                        // label={t("warehouse.notSel")}
                        options={categories}
                        classname="w-64"
                        {...register('ownerCategoryId')}
                        value={formData.ownerCategoryId}
                        onChange={(value) => handleInputChange('ownerCategoryId', value)}
                        isDisabled={isEditMode}
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("warehouse.about")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.description}
                        changeValue={(e) => handleInputChange('description', e.target.value)}
                    />
                    <div className="flex space-x-4">
                        <Button
                            title={t("warehouse.reset")}
                            type='outline'
                            handleClick={() => {
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("routes.create")}
                            form={true}
                            isLoading={isEditMode ? updatingCat : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default InventoryGroups;