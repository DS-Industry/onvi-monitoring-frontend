import Button from "@/components/ui/Button/Button";
import ReactBigCalendar from "@/components/ui/Calendar/ReactBigCalendar";
import DateTimeInput from "@/components/ui/Input/DateTimeInput";
import DropdownInput from "@/components/ui/Input/DropdownInput";
// import Input from "@/components/ui/Input/Input";
// import ScheduleCalendar from "@/components/ui/Table/ScheduleCalendar";
// import ScheduleTable from "@/components/ui/Table/ScheduleTable";
import GenericTabs from "@/components/ui/Tabs/GenericTab";
import { useCity } from "@/hooks/useAuthStore";
import useFormHook from "@/hooks/useFormHook";
import { getPoses } from "@/services/api/equipment";
import { createShift, getShiftById } from "@/services/api/finance";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const TimeSheetCreation: React.FC = () => {
    const { t } = useTranslation();
    const city = useCity();

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const defaultValues = {
        posId: 0,
        startDate: '',
        endDate: ''
    };

    const [formData, setFormData] = useState(defaultValues);
    const [shiftId, setShiftId] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

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

    const onSubmit = async () => {

        try {
            const result = await postShift();
            if (result) {
                setShiftId(result.props.id);
                navigate(-1);
            } else {
                throw new Error('Invalid update data.');
            }

        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    }

    const tabItems = [
        {
            key: "0",
            label: t("equipment.table"),
            content: <></>,
        },
        {
            key: "1",
            label: t("equipment.card"),
            content: <ReactBigCalendar
                shiftReportId={shiftId}
            />,
        }
    ];

    return (
        <div>
            {location.state?.ownerId === 0 && <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                <div className="flex space-x-4">
                    <DateTimeInput
                        title={t("finance.start") + "*"}
                        value={formData.startDate ? dayjs(formData.startDate) : undefined}
                        changeValue={(date) =>
                            handleInputChange("startDate", date ? date.format("YYYY-MM-DDTHH:mm") : "")
                        }
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message || ""}
                        {...register("startDate", { required: "Start DateTime is required" })}
                        classname="w-64"
                    />

                    <DateTimeInput
                        title={t("finance.end") + "*"}
                        value={formData.endDate ? dayjs(formData.endDate) : undefined}
                        changeValue={(date) =>
                            handleInputChange("endDate", date ? date.format("YYYY-MM-DDTHH:mm") : "")
                        }
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message || ""}
                        {...register("endDate", { required: "End DateTime is required" })}
                        classname="w-64"
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
            </form>}
            {location.state?.ownerId !== 0 &&<div className="mt-10">
                <GenericTabs tabs={tabItems} />
            </div>}
        </div>
    )
}

export default TimeSheetCreation;