import NoDataUI from "@/components/ui/NoDataUI";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PositionEmpty from "@/assets/NoPosition.png";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import useFormHook from "@/hooks/useFormHook";
import { useButtonCreate } from "@/components/context/useContext";
import Button from "@/components/ui/Button/Button";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsPositions } from "@/utils/OverFlowTableData";

const Positions: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();

    const positions: { name: string, value: string, render: JSX.Element }[] = [
        {
            name: t("hr.admin"),
            value: "Admin",
            render: (
                <div className="flex flex-col items-start">
                    <div>{t("hr.admin")}</div>
                    <div className="text-text02">{t("hr.accessTo")}</div>
                </div>
            )
        },
        {
            name: t("hr.accountant"),
            value: "Accountant",
            render: (
                <div className="flex flex-col items-start">
                    <div>{t("hr.accountant")}</div>
                    <div className="text-text02">{t("hr.sec")}</div>
                </div>
            )
        },
        {
            name: t("hr.lineOperator"),
            value: "lineOperator",
            render: (
                <div className="flex flex-col items-start">
                    <div>{t("hr.lineOperator")}</div>
                    <div className="text-text02">{t("hr.sec")}</div>
                </div>
            )
        },
        {
            name: t("hr.washer"),
            value: "washer",
            render: (
                <div className="flex flex-col items-start">
                    <div>{t("hr.washer")}</div>
                    <div className="text-text02">{t("hr.secti")}</div>
                </div>
            )
        }
    ];

    const defaultValues = {
        jobTitle: "",
        description: "",
        access: "No",
        role: ""
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    type FieldType = "jobTitle" | "description" | "access" | "role";

    const handleInputChange = (field: FieldType, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setValue(field, value);
    };

    const resetForm = () => {
        setFormData(defaultValues);
        // setIsEditMode(false);
        reset();
        // setEditInventoryId(0);
        setButtonOn(!buttonOn);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        // try {
        //     if (editInventoryId) {
        //         const result = await updateInventory();
        //         console.log(result);
        //         if (result) {
        //             console.log(result);
        //             setCategory(result.props.categoryId)
        //             mutate([`get-inventory`, result.props.categoryId, orgId]);
        //             resetForm();
        //         } else {
        //             throw new Error('Invalid update data.');
        //         }
        //     } else {
        //         const result = await createInventory();
        //         if (result) {
        //             console.log('API Response:', result);
        //             setCategory(result.props.categoryId)
        //             mutate([`get-inventory`, result.props.categoryId, orgId]);
        //             resetForm();
        //         } else {
        //             throw new Error('Invalid response from API');
        //         }
        //     }
        // } catch (error) {
        //     console.error("Error during form submission: ", error);
        // }
    };

    const positionsData = [
        { jobTitle: "abcd", access: "Yes", description: "checking table", role: t("hr.washer") }
    ]

    return (
        <div>
            {positions.length > 0 ? (
                <div className="mt-8">
                    <OverflowTable
                        tableData={positionsData}
                        columns={columnsPositions} 
                        isUpdate={true}
                    />
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center">
                    <NoDataUI
                        title={t("hr.no")}
                        description={t("hr.create")}
                    >
                        <img src={PositionEmpty} className="mx-auto" />
                    </NoDataUI>
                </div>
            )}
            <DrawerCreate>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("hr.pos")}</div>
                    <div className="flex">
                        <span className="font-semibold text-sm text-text01">{t("routine.fields")}</span>
                        <span className="text-errorFill">*</span>
                        <span className="font-semibold text-sm text-text01">{t("routine.are")}</span>
                    </div>
                    <Input
                        title={`${t("hr.name")}*`}
                        label={t("hr.enterJob")}
                        type={"text"}
                        classname="w-80"
                        value={formData.jobTitle}
                        changeValue={(e) => handleInputChange('jobTitle', e.target.value)}
                        error={!!errors.jobTitle}
                        {...register('jobTitle', { required: 'jobTitle is required' })}
                        helperText={errors.jobTitle?.message || ''}
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
                    <div className="flex space-x-2 items-center">
                        <input
                            type="checkbox"
                            className="w-[18px] h-[18px]"
                            checked={formData.access === "Yes"}
                            onChange={() => handleInputChange("access", formData.access === "Yes" ? "No" : "Yes")}
                        />
                        <div className="text-text01">{t("roles.acc")}</div>
                    </div>
                    <DropdownInput
                        title={`${t("hr.the")}*`}
                        label={t("hr.select")}
                        options={positions}
                        renderOption={(option) => option.render || <span>{option.name}</span>}
                        classname="w-80"
                        {...register('role', { required: 'role is required' })}
                        value={formData.role}
                        onChange={(value) => handleInputChange('role', value)}
                        error={!!errors.role}
                        helperText={errors.role?.message || ''}
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
                            title={t("hr.pos")}
                            form={true}
                            // isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
        </div>
    )
}

export default Positions;