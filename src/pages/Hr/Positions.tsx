import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PositionEmpty from "@/assets/NoPosition.png";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import { columnsPositions } from "@/utils/OverFlowTableData";
import useSWR, { mutate } from "swr";
import { createPosition, getPositions, updatePosition } from "@/services/api/hr";
import useSWRMutation from "swr/mutation";
import DynamicTable from "@/components/ui/Table/DynamicTable";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import { useCity } from "@/hooks/useAuthStore";
import { getOrganization } from "@/services/api/organization";
import DropdownInput from "@/components/ui/Input/DropdownInput";

type PositionRequest = {
    name: string;
    organizationId: number;
    description?: string;
}

const Positions: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPositionId, setEditPositionId] = useState<number>(0);
    const city = useCity();

    const { data: organizationData } = useSWR([`get-organization`], () => getOrganization({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const organizations: { name: string; value: number; }[] = organizationData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const { data: positionData, isLoading: positionLoading, isValidating } = useSWR([`get-positions`], () => getPositions(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const defaultValues: PositionRequest = {
        name: "",
        organizationId: 0,
        description: undefined,
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createPos, isMutating } = useSWRMutation(['create-position'], async () => createPosition({
        name: formData.name,
        organizationId: formData.organizationId,
        description: formData.description
    }));

    const { trigger: updatePos, isMutating: updatingPosition } = useSWRMutation(['update-position'], async () => updatePosition({
        positionId: editPositionId,
        description: formData.description
    }));

    type FieldType = "name" | "organizationId" | "description";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const handleUpdate = (id: number) => {
        setEditPositionId(id);
        setIsEditMode(true);
        setButtonOn(true);
        const positionToEdit = positionsData.find((pos) => pos.id === id);
        if (positionToEdit) {
            setFormData({
                name: positionToEdit.name,
                organizationId: positionToEdit.organizationId,
                description: positionToEdit.description
            });
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditPositionId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async () => {
        try {
            if (editPositionId) {
                const result = await updatePos();
                if (result) {
                    mutate([`get-positions`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createPos();
                if (result) {
                    mutate([`get-positions`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    const positionsData = positionData?.map((pos) => pos.props) || [];

    return (
        <div>
            {positionLoading || isValidating ? (
                <TableSkeleton columnCount={columnsPositions.length} />
            ) : positionsData.length > 0 ? (
                <div className="mt-8">
                    <DynamicTable
                        data={positionsData}
                        columns={columnsPositions}
                        onEdit={handleUpdate}
                    />
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("hr.no")}
                        description={t("hr.create")}
                    >
                        <img src={PositionEmpty} className="mx-auto" loading="lazy" alt="Positions" />
                    </NoDataUI>
                </div>
            )}
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{isEditMode ? t("hr.update") : t("hr.pos")}</div>
                    <div className="flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        title={`${t("hr.name")}*`}
                        label={t("hr.enter")}
                        type={"text"}
                        classname="w-80"
                        value={formData.name}
                        changeValue={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        {...register('name', { required: !isEditMode && 'Name is required' })}
                        helperText={errors.name?.message || ''}
                        disabled={isEditMode}
                    />
                    <DropdownInput
                        title={t("warehouse.organization")}
                        options={organizations}
                        classname="w-64"
                        {...register('organizationId', {
                            required: !isEditMode && 'Organization Id is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Organization Id is required"
                        })}
                        value={formData.organizationId}
                        onChange={(value) => handleInputChange('organizationId', value)}
                        error={!!errors.organizationId}
                        helperText={errors.organizationId?.message}
                        isDisabled={isEditMode}
                    />
                    <MultilineInput
                        title={t("warehouse.desc")}
                        label={t("hr.about")}
                        classname="w-80"
                        inputType="secondary"
                        value={formData.description}
                        changeValue={(e) => handleInputChange('description', e.target.value)}
                        {...register('description')}
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <Button
                            title={t("organizations.cancel")}
                            type="outline" handleClick={() => {
                                setButtonOn(!buttonOn);
                                resetForm();
                            }}
                        />
                        <Button
                            title={isEditMode ? t("hr.update") : t("hr.pos")}
                            form={true}
                            isLoading={isEditMode ? updatingPosition : isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default Positions;