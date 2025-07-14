import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
    onSubmitWorker: (userId: number) => void;
    workers: { name: string; surname: string; value: number }[];
}

type ShiftFormData = {
    typeWorkDay: TypeWorkDay | undefined;
    estimation: TypeEstimation | null;
    prize: string | number;
    fine: string | number;
    comment: string;
    hours_start: number;
    minutes_start: number;
    hours_end: number;
    minutes_end: number;
};

const EditShiftModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, event, workers, onSubmitWorker }) => {
    const { t } = useTranslation();
    const [selectedUserId, setSelectedUserId] = useState(event.workerId);

    const {
        control,
        handleSubmit,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            typeWorkDay: event?.typeWorkDay || undefined,
            estimation: event?.estimation || null,
            prize: event?.prize ?? "",
            fine: event?.fine ?? "",
            comment: event?.comment ?? "",
            hours_start: dayjs(event.startWorkingTime).hour(),
            minutes_start: dayjs(event.startWorkingTime).minute(),
            hours_end: dayjs(event.endWorkingTime).hour(),
            minutes_end: dayjs(event.endWorkingTime).minute(),
        },
    });

    const watchType = watch("typeWorkDay");

    useEffect(() => {
        reset({
            typeWorkDay: event?.typeWorkDay || undefined,
            estimation: event?.estimation || null,
            prize: event?.prize ?? "",
            fine: event?.fine ?? "",
            comment: event?.comment ?? "",
            hours_start: dayjs(event.startWorkingTime).hour(),
            minutes_start: dayjs(event.startWorkingTime).minute(),
            hours_end: dayjs(event.endWorkingTime).hour(),
            minutes_end: dayjs(event.endWorkingTime).minute(),
        });
    }, [event, reset]);

    const handleModalSubmit = (data: ShiftFormData) => {
        const start = dayjs(event.startWorkingTime)
            .set("hour", Number(data.hours_start))
            .set("minute", Number(data.minutes_start))
            .set("second", 0)
            .set("millisecond", 0);

        let end = dayjs(event.startWorkingTime)
            .set("hour", Number(data.hours_end))
            .set("minute", Number(data.minutes_end))
            .set("second", 0)
            .set("millisecond", 0);

        // Handle cross-day shifts
        if (end.isBefore(start)) {
            end = end.add(1, "day");
        }

        const totalMinutes = end.diff(start, "minutes");
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const payload: UpdateDayShiftBody = {
            startWorkingTime: start.toDate(),
            endWorkingTime: end.toDate(),
            timeWorkedOut: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
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
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text01">
                    {t("calendar.sch")}
                </h2>
                <Close onClick={onClose} className="cursor-pointer text-text01" />
            </div>

            <form onSubmit={handleSubmit(handleModalSubmit)} className="text-text02 space-y-4 mt-4">
                <DropdownInput
                    title={t("calendar.addWorker")}
                    label={t("calendar.select")}
                    options={workers.map(w => ({
                        name: `${w.name} ${w.surname}`,
                        value: w.value,
                    }))}
                    value={selectedUserId}
                    onChange={(val) => {
                        setSelectedUserId(val);
                        onSubmitWorker(val);
                    }}
                    classname="w-80 sm:w-96"
                />
                {/* Type of Day */}
                <Controller
                    name="typeWorkDay"
                    control={control}
                    render={({ field }) => (
                        <DropdownInput
                            title={t("finance.day")}
                            value={field.value}
                            options={Object.values(TypeWorkDay).map((type) => ({
                                name: t(`finance.${type}`),
                                value: type,
                            }))}
                            classname="w-80 sm:w-96"
                            onChange={field.onChange}
                        />
                    )}
                />

                {/* Working shift fields */}
                {watchType === "WORKING" && (
                    <>
                        <div className="flex space-x-4">
                            <div>
                                <div>{t("finance.start")}</div>
                                <div className="flex space-x-2">
                                    <Controller
                                        name="hours_start"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="HH"
                                                classname="w-[70px]"
                                                value={field.value}
                                                changeValue={field.onChange}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="minutes_start"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="MM"
                                                classname="w-[70px]"
                                                value={field.value}
                                                changeValue={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <div>{t("finance.endOf")}</div>
                                <div className="flex space-x-2">
                                    <Controller
                                        name="hours_end"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="HH"
                                                classname="w-[70px]"
                                                value={field.value}
                                                changeValue={field.onChange}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="minutes_end"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="MM"
                                                classname="w-[70px]"
                                                value={field.value}
                                                changeValue={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <Controller
                                name="prize"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        title={t("finance.prize")}
                                        type="number"
                                        classname="w-44"
                                        value={field.value}
                                        changeValue={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                name="fine"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        title={t("finance.fine")}
                                        type="number"
                                        classname="w-44"
                                        value={field.value}
                                        changeValue={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <Controller
                            name="estimation"
                            control={control}
                            render={({ field }) => (
                                <DropdownInput
                                    title={t("finance.grade")}
                                    value={field.value}
                                    options={Object.values(TypeEstimation).map((type) => ({
                                        name: t(`finance.${type}`),
                                        value: type,
                                    }))}
                                    onChange={field.onChange}
                                    classname="w-80 sm:w-96"
                                />
                            )}
                        />

                        <Controller
                            name="comment"
                            control={control}
                            render={({ field }) => (
                                <MultilineInput
                                    title={t("equipment.comment")}
                                    value={field.value}
                                    changeValue={field.onChange}
                                    classname="w-80 sm:w-96"
                                    inputType="secondary"
                                />
                            )}
                        />
                    </>
                )}

                <div className="flex gap-3">
                    <Button title={t("warehouse.reset")} handleClick={onClose} type="outline" />
                    <Button title={t("routes.save")} form={true} />
                </div>
            </form>
        </Modal>
    );
};

export default EditShiftModal;
