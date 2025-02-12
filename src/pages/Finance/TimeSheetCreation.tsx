import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import ScheduleTable from "@/components/ui/Table/ScheduleTable";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const TimeSheetCreation: React.FC = () => {
    const { t } = useTranslation();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues = {
        posId: 0,
        cashCollectionDate: ''
    };

    const [formData, setFormData] = useState(defaultValues);

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    type FieldType = "posId" | "cashCollectionDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);

        // try {
        //     const result = await postColl();
        //     console.log(result);
        //     if (result) {
        //         console.log(result);
        //         setTableData(result.cashCollectionDeviceType);
        //         setDeviceData(result.cashCollectionDevice);
        //         setCollection(result);
        //         // resetForm();
        //     } else {
        //         throw new Error('Invalid update data.');
        //     }

        // } catch (error) {
        //     console.error("Error during form submission: ", error);
        // }
    }

    const handleDateTimeChange = (value: string, type: string) => {
        setFormData((prev) => {
            const currentDate = prev.cashCollectionDate ? prev.cashCollectionDate.split("T") : ["", ""];
            const updatedDateTime =
                type === "date" ? value + "T" + (currentDate[1] || "00:00") : currentDate[0] + "T" + value;

            const updatedFormData = { ...prev, cashCollectionDate: updatedDateTime };

            setValue("cashCollectionDate", updatedDateTime);

            return updatedFormData;
        });
    };


    return (
        <div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-4">
                    <Input
                        type="date"
                        title={t("finance.end")}
                        classname="w-44"
                        value={formData.cashCollectionDate ? formData.cashCollectionDate.split("T")[0] : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "date")}
                        error={!!errors.cashCollectionDate}
                        {...register("cashCollectionDate", { required: "Cash Collection DateTime is required" })}
                        helperText={errors.cashCollectionDate?.message || ""}
                    />
                    <Input
                        type="time"
                        classname="w-32 mt-6"
                        value={formData.cashCollectionDate ? formData.cashCollectionDate.split("T")[1]?.slice(0, 5) : ""}
                        changeValue={(e) => handleDateTimeChange(e.target.value, "time")}
                        error={!!errors.cashCollectionDate}
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
                        // isLoading={collectionLoading}
                        form={true}
                    />
                </div>
            </form>
            <div className="mt-10">
                <ScheduleTable />
            </div>
        </div>
    )
}

export default TimeSheetCreation;