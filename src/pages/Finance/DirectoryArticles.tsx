import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InventoryEmpty from "@/assets/NoInventory.png"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate, useSnackbar } from "@/components/context/useContext";
import useSWRMutation from "swr/mutation";
import useSWR, { mutate } from "swr";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { columnsPaperTypes } from "@/utils/OverFlowTableData";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import { createManagerPaperType, getAllManagerPaperTypes, updateManagerPaperType } from "@/services/api/finance";
import DropdownInput from "@/components/ui/Input/DropdownInput";

enum ManagerPaperTypeClass {
    RECEIPT = "RECEIPT",
    EXPENDITURE = "EXPENDITURE"
}

const DirectoryArticles: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPaperId, setEditPaperId] = useState<number>(0);
    const { data: paperTypeData, isLoading: loadingPaperType } = useSWR([`get-manager-paper-type`], () => getAllManagerPaperTypes(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });
    const { showSnackbar } = useSnackbar();

    const paperTypes = paperTypeData?.map((type) => ({
        ...type.props,
        typeName: t(`finance.${type.props.type}`)
    })) || [];

    const defaultValues = {
        name: "",
        type: ""
    }

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createPap, isMutating } = useSWRMutation(['create-paper'], async () => createManagerPaperType({
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass
    }));

    const { trigger: updatePaperType, isMutating: updatingPaperType } = useSWRMutation(['update-paper'], async () => updateManagerPaperType({
        id: editPaperId,
        name: formData.name,
        type: formData.type as ManagerPaperTypeClass
    }));

    type FieldType = "name" | "type";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const handleUpdate = async (id: number) => {
        setEditPaperId(id);
        setIsEditMode(true);
        setButtonOn(true);

        const paperToEdit = paperTypes.find((paper) => paper.id === id);

        if (paperToEdit) {
            setFormData({
                name: paperToEdit.name,
                type: paperToEdit.type as ManagerPaperTypeClass
            });
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditPaperId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async () => {
        try {
            if (editPaperId) {
                const result = await updatePaperType();
                if (result) {
                    mutate([`get-manager-paper-type`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            } else {
                const result = await createPap();
                if (result) {
                    mutate([`get-manager-paper-type`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            showSnackbar("Error during form submission", "error");
            console.error("Error during form submission: ", error);
        }
    };


    return (
        <>
            {loadingPaperType ? (
                <TableSkeleton columnCount={columnsPaperTypes.length} />
            ) : paperTypes.length > 0 ?
                <div className="mt-8">
                    <DynamicTable
                        data={paperTypes}
                        columns={columnsPaperTypes}
                        onEdit={handleUpdate}
                    />
                </div> :
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("warehouse.noExpanse")}
                        description={""}
                    >
                        <img src={InventoryEmpty} className="mx-auto" loading="lazy" alt="Suppliers" />
                    </NoDataUI>
                </div>
            }
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("finance.articleType")}</div>
                    <span className="font-semibold text-sm text-text01">{t("warehouse.fields")}</span>
                    <div className="font-semibold text-2xl mb-5 text-text01">{t("warehouse.basic")}</div>
                    <Input
                        type={""}
                        title={t("warehouse.supName")}
                        label={t("warehouse.enterSup")}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: !isEditMode && 'Name is required' })}
                        helperText={errors.name?.message || ''}
                    />
                    <DropdownInput
                        title={`${t("finance.article")}*`}
                        label={t("finance.articleType")}
                        classname="w-80"
                        options={
                            Object.values(ManagerPaperTypeClass).map((type) => ({
                                name: t(`finance.${type}`),
                                value: type as ManagerPaperTypeClass
                            }))
                        }
                        {...register('type', { required: !isEditMode && 'Type is required' })}
                        value={formData.type}
                        onChange={(value) => handleInputChange('type', value)}
                        error={!!errors.type}
                        helperText={errors.type?.message || ''}
                    />
                    <div className="flex space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                setButtonOn(!buttonOn);
                                resetForm();
                            }} />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isEditMode ? updatingPaperType : isMutating}
                            handleClick={() => { }} />
                    </div>
                </form>
            </DrawerCreate>
        </>
    )
}

export default DirectoryArticles;