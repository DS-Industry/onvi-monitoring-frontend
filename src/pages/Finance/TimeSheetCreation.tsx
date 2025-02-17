import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import ScheduleTable from "@/components/ui/Table/ScheduleTable";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { createShift, getShiftById } from "@/services/api/finance";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

type TimeSheet = {
    props: {
        id: number;
        posId: number;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        updatedAt: Date;
        createdById: number;
        updatedById: number;
    }
}

const TimeSheetCreation: React.FC = () => {
    const { t } = useTranslation();

    const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues = {
        posId: 0,
        startDate: '',
        endDate: ''
    };

    const [formData, setFormData] = useState(defaultValues);
    const [shiftId, setShiftId] = useState(0);
    const [shift, setShift] = useState<TimeSheet>({} as TimeSheet);
    const location = useLocation();

    const { register, handleSubmit, errors, setValue } = useFormHook(formData);

    const { trigger: postShift, isMutating: shiftLoading } = useSWRMutation(['create-shift'], async () => createShift({
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        posId: formData.posId
    }));

    const { data: shiftData } = useSWR(location?.state?.ownerId !== 0 ? [`get-shift-data`] : null, () => getShiftById(location.state.ownerId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    type FieldType = "posId" | "startDate" | "endDate";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['posId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    useEffect(() => {
        if (shiftData) {
            setShiftId(shiftData.id);
        } else {
            setShiftId(0);
        }
    }, [shiftData]);

    const onSubmit = async (data: unknown) => {
        console.log('Form data:', data);

        try {
            const result = await postShift();
            console.log(result);
            if (result) {
                console.log(result);
                setShiftId(result.props.id);
                setShift(result);
            } else {
                throw new Error('Invalid update data.');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
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
            {location.state?.ownerId === 0 && <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                        isLoading={shiftLoading}
                        form={true}
                    />
                </div>
            </form> }
            <div className="mt-10">
                <ScheduleTable id={shiftId} shift={shift} />
            </div>
        </div>
    )
}

export default TimeSheetCreation;