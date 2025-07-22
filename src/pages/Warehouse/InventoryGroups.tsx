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
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import Table, { ColumnsType } from "antd/es/table";
import { usePermissions } from "@/hooks/useAuthStore";
import AntDButton from "antd/es/button";
import { EditOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Can } from "@/permissions/Can";

type TreeData = {
    id: number;
    name: string;
    description?: string;
    children?: TreeData[];
    isExpanded?: boolean;
    [key: string]: unknown;
};

type CATEGORY = {
    name: string;
    description?: string;
    ownerCategoryId?: number;
}

const buildTree = (data: unknown[]): TreeData[] => {
    const map: Record<number, TreeData> = {};
    const roots: TreeData[] = [];

    data.forEach((item) => {
        const typedItem = item as TreeData;
        map[typedItem.id] = { ...typedItem, children: [] };
    });

    data.forEach((item) => {
        const typedItem = item as TreeData;
        if (typedItem.ownerCategoryId === null || typeof typedItem.ownerCategoryId !== "number") {
            roots.push(map[typedItem.id]);
        } else if (typeof typedItem.ownerCategoryId === "number" && map[typedItem.ownerCategoryId]) {
            map[typedItem.ownerCategoryId]?.children?.push(map[typedItem.id]);
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
        const inventoryToEdit = category.find((inventory) => inventory.id === id);
        if (inventoryToEdit) {
            setFormData({
                name: inventoryToEdit.name,
                description: inventoryToEdit.description,
                ownerCategoryId: inventoryToEdit.ownerCategoryId
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

    const onSubmit = async () => {
        try {
            if (editInventoryId) {
                const result = await updateCat();
                if (result) {
                    mutate([`get-category`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createCat();
                if (result) {
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

    const columnsCategory = [
        {
            label: "Название группы",
            key: "name"
        },
        {
            label: "Описание",
            key: "description"
        },
    ];

    const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
    const userPermissions = usePermissions();

    const handleExpand = (id: number) => {
        setExpandedRowKeys((prev) =>
            prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
        );
    };

    const generateColumns = (): ColumnsType<TreeData> => {
        // Expand/Collapse Column (First Column)
        const expandColumn = {
            title: "", // Empty title for cleaner UI
            dataIndex: "expand",
            key: "expand",
            width: 50, // Small width to keep it compact
            render: (_: unknown, record: TreeData) => (
                record.children && record.children.length > 0 ? (
                    <AntDButton
                        type="text"
                        size="small"
                        icon={expandedRowKeys.includes(record.id) ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
                        onClick={() => handleExpand(record.id)}
                    />
                ) : null
            ),
        };

        // Data Columns (Middle Columns)
        const dataColumns = columnsCategory.map((col, index) => ({
            title: col.label,
            dataIndex: col.key,
            key: col.key,
            render: (value: unknown, record: TreeData): React.ReactNode => {
                // Only apply indent to the first column
                if (index === 0) {
                    const level = record._level ?? 0;
                    return (
                        <div style={{ paddingLeft: (typeof level === "number" ? level : 0) * 20 }}>
                            {typeof value === "string" || typeof value === "number" ? value : String(value)}
                        </div>
                    );
                }
                // Ensure always returning ReactNode
                if (typeof value === "string" || typeof value === "number") {
                    return value;
                }
                if (value === undefined || value === null) {
                    return "";
                }
                return String(value);
            }
        }));

        // Actions Column (Last Column)
        const actionColumn = {
            title: "",
            dataIndex: "actions",
            key: "actions",
            width: 80, // Ensure it's at the end
            render: (_: unknown, record: TreeData) => (
                <Can
                    requiredPermissions={[
                        { action: "manage", subject: "Warehouse" },
                        { action: "update", subject: "Warehouse" },
                    ]}
                    userPermissions={userPermissions}
                >
                    {(allowed) =>
                        allowed &&
                        (
                            <AntDButton type="link"
                                icon={<EditOutlined className="text-blue-500 hover:text-blue-700" />}
                                onClick={() => handleUpdate(record.id)}
                            />
                        )
                    }
                </Can>
            ),
        };

        return [expandColumn, ...dataColumns, actionColumn]; // Order: Expand Button → Data Columns → Edit Button
    };

    // Function to format data and include expanded state
    const formatData = (data: TreeData[], level: number = 0): TreeData[] => {
        return data.reduce<TreeData[]>((acc, item) => {
            acc.push({
                ...item,
                key: item.id,
                _level: level
            });

            // Add children only if this row is expanded
            if (expandedRowKeys.includes(item.id) && item.children) {
                acc.push(...formatData(item.children, level + 1));
            }

            return acc;
        }, []);
    };


    return (
        <>
            {loadingCategory ? (
                <TableSkeleton columnCount={columnsCategory.length} />
            ) : treeData.length > 0 ?
                <div className="mt-8">
                    <Table
                        columns={generateColumns()}
                        dataSource={formatData(treeData)}
                        pagination={false}
                        expandable={{ expandIcon: () => null }}
                        scroll={{ x: "max-content" }}
                    />
                </div> :
                <NoDataUI
                    title={t("warehouse.nomenclature")}
                    description={""}
                >
                    <img src={InventoryEmpty} className="mx-auto" loading="lazy" alt="Inventory" />
                </NoDataUI>
            }
            <DrawerCreate classname="w-[440px]" onClose={resetForm}>
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