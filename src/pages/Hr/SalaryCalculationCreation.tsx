import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { useCity } from "@/hooks/useAuthStore";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { columnsSalaryCalcCreation } from "@/utils/OverFlowTableData";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Icon from 'feather-icons-react';

const SalaryCalculationCreation: React.FC = () => {
    const { t } = useTranslation();
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues = {
        posId: 0,
        startDate: '',
        endDate: ''
    };

    const [formData, setFormData] = useState(defaultValues);
    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    type FieldType = "posId" | "startDate" | "endDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);

        // try {
        //     const result = await postShift();
        //     console.log(result);
        //     if (result) {
        //         console.log(result);
        //         setShiftId(result.props.id);
        //         setShift(result);
        //     } else {
        //         throw new Error('Invalid update data.');
        //     }

        // } catch (error) {
        //     console.error("Error during form submission: ", error);
        // }
    }

    const handleDateTimeChange = (value: string, field: "startDate" | "endDate", type: "date" | "time") => {
        setFormData((prev) => {
            const currentDate = prev[field] ? prev[field].split("T") : ["", ""];
            const updatedDateTime =
                type === "date" ? value + "T" + (currentDate[1] || "00:00") : currentDate[0] + "T" + value;

            const updatedFormData = { ...prev, [field]: updatedDateTime };

            setValue(field, updatedDateTime);

            return updatedFormData;
        });
    };

    return (
        <div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-4">
                    <Input
                        type="date"
                        title={t("finance.start")}
                        classname="w-44"
                        value={formData.startDate ? formData.startDate.split("T")[0] : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "startDate", "date")}
                        error={!!errors.startDate}
                        {...register("startDate", { required: "Start DateTime is required" })}
                        helperText={errors.startDate?.message || ""}
                    />
                    <Input
                        type="time"
                        classname="w-32 mt-6"
                        value={formData.startDate ? formData.startDate.split("T")[1]?.slice(0, 5) : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "startDate", "time")}
                        error={!!errors.startDate}
                    />
                    <Input
                        type="date"
                        title={t("finance.end")}
                        classname="w-44"
                        value={formData.endDate ? formData.endDate.split("T")[0] : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "endDate", "date")}
                        error={!!errors.endDate}
                        {...register("endDate", { required: "End DateTime is required" })}
                        helperText={errors.endDate?.message || ""}
                    />
                    <Input
                        type="time"
                        classname="w-32 mt-6"
                        value={formData.endDate ? formData.endDate.split("T")[1]?.slice(0, 5) : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "endDate", "time")}
                        error={!!errors.endDate}
                    />
                </div>
                <DropdownInput
                    title={t("finance.carWash")}
                    options={poses}
                    classname="w-64"
                    {...register('posId', {
                        required: 'Pos ID is required',
                        validate: (value) =>
                            (value !== 0) || "Pos ID is required"
                    })}
                    value={formData.posId}
                    onChange={(value) => handleInputChange('posId', value)}
                    error={!!errors.posId}
                    helperText={errors.posId?.message}
                />
                <div className="flex justify-between">
                    <Button
                        title={t("finance.form")}
                        // isLoading={shiftLoading}
                        form={true}
                    />
                </div>
                <div className="mt-8">
                    <OverflowTable
                        tableData={[]}
                        columns={columnsSalaryCalcCreation}
                    />
                    <div className="flex space-x-2 mt-2 cursor-pointer items-center text-primary02">
                        <Icon icon="plus" className="w-6 h-6" />
                        <div>{t("routes.addE")}</div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default SalaryCalculationCreation;