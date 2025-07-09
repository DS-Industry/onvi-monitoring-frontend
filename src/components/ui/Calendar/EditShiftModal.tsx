import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarEvent } from "./ReactBigCalendar";
import { TypeWorkDay, TypeEstimation, UpdateDayShiftBody } from "@/services/api/finance";
import Modal from "@/components/ui/Modal/Modal";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UpdateDayShiftBody) => void;
    event: CalendarEvent;
}

const EditShiftModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, event }) => {
    const { t } = useTranslation();

    const {
        register,
        setValue,
        handleSubmit,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            typeWorkDay: event?.typeWorkDay || "",
            estimation: event?.estimation || null,
            prize: event?.prize ?? "",
            fine: event?.fine ?? "",
            comment: event?.comment ?? "",
            hours_start: dayjs(event.startWorkingTime).toDate().getHours(),
            minutes_start: dayjs(event.startWorkingTime).toDate().getMinutes(),
            hours_end: dayjs(event.endWorkingTime).toDate().getHours(),
            minutes_end: dayjs(event.endWorkingTime).toDate().getMinutes(),
        },
    });

    const watchType = watch("typeWorkDay");
    const watchEstimation = watch("estimation");
    const watchComment = watch("comment");

    useEffect(() => {
        reset({
            typeWorkDay: event?.typeWorkDay || "",
            estimation: event?.estimation || null,
            prize: event?.prize ?? "",
            fine: event?.fine ?? "",
            comment: event?.comment ?? "",
            hours_start: dayjs(event.startWorkingTime).toDate().getHours(),
            minutes_start: dayjs(event.startWorkingTime).toDate().getMinutes(),
            hours_end: dayjs(event.endWorkingTime).toDate().getHours(),
            minutes_end: dayjs(event.endWorkingTime).toDate().getMinutes(),
        });
    }, [event, reset]);

    const handleModalSubmit = (data: any) => {
        const start = dayjs(event.startWorkingTime).toDate();
        start.setHours(data.hours_start);
        start.setMinutes(data.minutes_start);

        const end = dayjs(event.endWorkingTime).toDate();
        end.setHours(data.hours_end);
        end.setMinutes(data.minutes_end);

        const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes

        const payload: UpdateDayShiftBody = {
            startWorkingTime: start,
            endWorkingTime: end,
            timeWorkedOut: `${duration} mins`,
            typeWorkDay: data.typeWorkDay,
            estimation: data.estimation,
            prize: data.prize ? Number(data.prize) : null,
            fine: data.fine ? Number(data.fine) : null,
            comment: data.comment,
        };

        onSubmit(payload);
    };

    return (
        <Modal isOpen={isOpen} classname="max-h-[650px] px-8 py-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text01">
                    {event.name}
                </h2>
                <Close onClick={onClose} className="cursor-pointer text-text01" />
            </div>

            <form onSubmit={handleSubmit(handleModalSubmit)} className="text-text02">
                {/* Type of Day */}
                <DropdownInput
                    title={t("finance.day")}
                    value={watch("typeWorkDay")}
                    options={Object.values(TypeWorkDay).map((type) => ({
                        name: t(`finance.${type}`),
                        value: type,
                    }))}
                    classname="w-80 sm:w-96 mb-4"
                    onChange={(value) => setValue("typeWorkDay", value)}
                />

                {/* Working shift fields */}
                {watchType === "WORKING" && (
                    <>
                        {/* Time Inputs */}
                        <div className="flex space-x-4 mb-4">
                            <div>
                                <div>{t("finance.start")}</div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="HH"
                                        classname="w-[70px]"
                                        {...register("hours_start")}
                                        value={watch("hours_start")}
                                        changeValue={(e) => setValue("hours_start", e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="MM"
                                        classname="w-[70px]"
                                        {...register("minutes_start")}
                                        value={watch("minutes_start")}
                                        changeValue={(e) => setValue("minutes_start", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div>{t("finance.endOf")}</div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="HH"
                                        classname="w-[70px]"
                                        {...register("hours_end")}
                                        value={watch("hours_end")}
                                        changeValue={(e) => setValue("hours_end", e.target.value)}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="MM"
                                        classname="w-[70px]"
                                        {...register("minutes_end")}
                                        value={watch("minutes_end")}
                                        changeValue={(e) => setValue("minutes_end", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Prize & Fine */}
                        <div className="flex space-x-4 mb-4">
                            <Input
                                title={t("finance.prize")}
                                type="number"
                                {...register("prize")}
                                classname="w-44"
                                value={watch("prize")}
                                changeValue={(e) => setValue("prize", e.target.value)}
                            />
                            <Input
                                title={t("finance.fine")}
                                type="number"
                                {...register("fine")}
                                classname="w-44"
                                value={watch("fine")}
                                changeValue={(e) => setValue("fine", e.target.value)}
                            />
                        </div>

                        {/* Estimation */}
                        <DropdownInput
                            title={t("finance.grade")}
                            value={watchEstimation}
                            options={Object.values(TypeEstimation).map((type) => ({
                                name: t(`finance.${type}`),
                                value: type,
                            }))}
                            onChange={(value) => setValue("estimation", value)}
                            classname="w-80 sm:w-96 mb-4"
                        />

                        {/* Comment */}
                        <MultilineInput
                            title={t("equipment.comment")}
                            value={watchComment}
                            changeValue={(e) => setValue("comment", e.target.value)}
                            classname="w-80 sm:w-96"
                            inputType="secondary"
                        />
                    </>
                )}

                {/* Footer */}
                <div className="flex gap-3 mt-10">
                    <Button title={t("warehouse.reset")} handleClick={onClose} type="outline" />
                    <Button title={t("routes.save")} form />
                </div>
            </form>
        </Modal>
    );
};

export default EditShiftModal;
