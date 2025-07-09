import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, dayjsLocalizer, Views, Event, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "../Modal/Modal";
import Close from "@icons/close.svg?react";
import { useTranslation } from "react-i18next";
import DropdownInput from "../Input/DropdownInput";
import Input from "../Input/Input";
import MultilineInput from "../Input/MultilineInput";
import useFormHook from "@/hooks/useFormHook";
import Icon from "feather-icons-react";
import Button from "../Button/Button";
import RedDot from "@icons/RedDot.svg?react";
import OrangeDot from "@icons/OrangeDot.svg?react";
import GreenDot from "@icons/GreenDot.svg?react";
import BN from "@icons/Бл.svg?react";
import OTN from "@icons/ОТП.svg?react";
import O from "@icons/О.svg?react";
import NP from "@icons/Пр.svg?react";
import useSWR, { mutate } from "swr";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWRMutation from "swr/mutation";
import { addWorker, createDayShift, getShiftById, updateDayShift } from "@/services/api/finance";
import { useLocation, useNavigate } from "react-router-dom";
import { useCity, usePosType } from "@/hooks/useAuthStore";
import { useUser } from "@/hooks/useUserStore";
import dayjs from "dayjs";

const localizer = dayjsLocalizer(dayjs);
interface ShiftEvent extends Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        employeeId: number;
        employeeName: string;
        workDate: string;
        typeWorkDay: TypeWorkDay;
        timeWorkedOut?: string;
        startWorkingTime?: string;
        endWorkingTime?: string;
        estimation?: TypeEstimation;
        prize?: number;
        fine?: number;
        comment?: string;
        status?: string;
        dayShiftId?: number;
    };
}

type FormData = {
    typeWorkDay?: TypeWorkDay;
    timeWorkedOut?: string;
    hours_timeWorkedOut?: string;
    minutes_timeWorkedOut?: string;
    startWorkingTime?: string;
    hours_startWorkingTime?: string;
    minutes_startWorkingTime?: string;
    endWorkingTime?: string;
    hours_endWorkingTime?: string;
    minutes_endWorkingTime?: string;
    estimation?: TypeEstimation | null;
    prize?: number | null;
    fine?: number | null;
    comment?: string;
};

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

type Props = {
    id: number;
    shift: TimeSheet;
}

enum TypeWorkDay {
    WORKING = "WORKING",
    WEEKEND = "WEEKEND",
    MEDICAL = "MEDICAL",
    VACATION = "VACATION",
    TIMEOFF = "TIMEOFF",
    TRUANCY = "TRUANCY"
}

enum TypeEstimation {
    NO_VIOLATION = "NO_VIOLATION",
    GROSS_VIOLATION = "GROSS_VIOLATION",
    MINOR_VIOLATION = "MINOR_VIOLATION",
    ONE_REMARK = "ONE_REMARK"
}

const ScheduleCalendar: React.FC<Props> = ({ id }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const city = useCity();
    const posType = usePosType();

    const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [userId, setUserId] = useState(0);
    const [posId, setPosId] = useState(posType);
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: posData } = useSWR([`get-pos`, city], () => getPoses({ placementId: city }), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const { data: shiftData } = useSWR(
        location.state?.ownerId ? [`get-shift-data`] : null,
        () => getShiftById(location.state?.ownerId),
        { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true }
    );

    const poses = useMemo(() => {
        return posData?.map((item) => ({ name: item.name, value: item.id })) || [];
    }, [posData]);

    const workers = useMemo(() => {
        return workerData?.map((item) => ({
            name: item.name,
            value: item.id,
            surname: item.surname
        })) || [];
    }, [workerData]);

    const { register, handleSubmit, setValue, watch, reset, errors } = useFormHook<FormData>({
        prize: undefined,
        fine: undefined,
        comment: "",
        typeWorkDay: "WEEKEND" as TypeWorkDay,
        estimation: undefined,
        timeWorkedOut: "",
        startWorkingTime: "",
        endWorkingTime: "",
        hours_timeWorkedOut: "",
        minutes_timeWorkedOut: "",
        hours_startWorkingTime: "",
        minutes_startWorkingTime: "",
        hours_endWorkingTime: "",
        minutes_endWorkingTime: ""
    });

    const { trigger: addWork, isMutating: addingWorker } = useSWRMutation(
        userId !== 0 ? ['add-worker'] : null,
        (_, { arg }: { arg: { userId: number; } }) => addWorker(arg, id)
    );

    const { trigger: createDayShiftTrigger } = useSWRMutation(
        ['create-day'],
        async (_, { arg }: { arg: { shiftReportId: number; userId: number; workDate: Date } }) => {
            return createDayShift(arg);
        }
    );

    const { trigger: updateDay, isMutating: updatingDayShift } = useSWRMutation(
        ['update-day-shift'],
        async (_, { arg }: {
            arg: {
                id: number;
                typeWorkDay?: TypeWorkDay;
                timeWorkedOut?: string;
                startWorkingTime?: Date;
                endWorkingTime?: Date;
                estimation?: TypeEstimation;
                prize?: number;
                fine?: number;
                comment?: string;
            }
        }) => {
            return updateDayShift(arg, arg.id);
        }
    );

    const watchFields = watch();
    const typeWorkDay = watch("typeWorkDay");
    const estimation = watch("estimation");
    const prize = watch("prize");
    const fine = watch("fine");
    const comment = watch("comment");

    // Convert shift data to calendar events
    const events = useMemo(() => {
        const calendarEvents: ShiftEvent[] = [];

        if (shiftData?.workers) {
            shiftData.workers.forEach((worker) => {
                worker.workDays?.forEach((workDay) => {
                    const workDate = new Date(workDay.workDate);
                    const startTime = workDay.startWorkingTime ? new Date(workDay.startWorkingTime) : new Date(workDate);
                    const endTime = workDay.endWorkingTime ? new Date(workDay.endWorkingTime) : new Date(workDate);

                    const eventTitle = getEventTitle(workDay.typeWorkDay, workDay.timeWorkedOut, worker.name);

                    calendarEvents.push({
                        id: `${worker.workerId}-${workDay.workDate}`,
                        title: eventTitle,
                        start: startTime,
                        end: endTime,
                        resource: {
                            employeeId: worker.workerId,
                            employeeName: `${worker.name} ${worker.middlename} ${worker.surname}`,
                            workDate: typeof workDay.workDate === "string" ? workDay.workDate : workDay.workDate.toISOString(),
                            typeWorkDay: workDay.typeWorkDay,
                            timeWorkedOut: workDay.timeWorkedOut,
                            startWorkingTime: workDay.startWorkingTime
                                ? (typeof workDay.startWorkingTime === "string"
                                    ? workDay.startWorkingTime
                                    : workDay.startWorkingTime.toISOString())
                                : undefined,
                            endWorkingTime: workDay.endWorkingTime ? (typeof workDay.endWorkingTime === "string" ? workDay.endWorkingTime : workDay.endWorkingTime.toISOString()) : undefined,
                            estimation: workDay.estimation,
                            prize: workDay.prize,
                            fine: workDay.fine,
                            comment: workDay.comment,
                            dayShiftId: workDay.workDayId
                        },
                    });
                });
            });
        }

        return calendarEvents;
    }, [shiftData]);

    function getEventTitle(typeWorkDay: TypeWorkDay, timeWorkedOut?: string, employeeName?: string): string {
        const shortName = employeeName?.split(' ')[0] || '';

        switch (typeWorkDay) {
            case TypeWorkDay.WORKING:
                return `${shortName} ${timeWorkedOut || ''}`;
            case TypeWorkDay.MEDICAL:
                return `${shortName} БЛ`;
            case TypeWorkDay.VACATION:
                return `${shortName} ОТП`;
            case TypeWorkDay.TIMEOFF:
                return `${shortName} О`;
            case TypeWorkDay.TRUANCY:
                return `${shortName} ПР`;
            default:
                return `${shortName} ВЫХ`;
        }
    }

    const handleSelectEvent = useCallback((event: ShiftEvent) => {
        setSelectedEvent(event);

        // Pre-fill form with event data
        const resource = event.resource;
        const updatedFormData = {
            typeWorkDay: resource.typeWorkDay,
            timeWorkedOut: resource.timeWorkedOut || "",
            hours_timeWorkedOut: resource.timeWorkedOut?.split(":")[0] || "",
            minutes_timeWorkedOut: resource.timeWorkedOut?.split(":")[1] || "",
            startWorkingTime: resource.startWorkingTime || "",
            hours_startWorkingTime: resource.startWorkingTime ? new Date(resource.startWorkingTime).getUTCHours().toString().padStart(2, "0") : "",
            minutes_startWorkingTime: resource.startWorkingTime ? new Date(resource.startWorkingTime).getUTCMinutes().toString().padStart(2, "0") : "",
            endWorkingTime: resource.endWorkingTime || "",
            hours_endWorkingTime: resource.endWorkingTime ? new Date(resource.endWorkingTime).getUTCHours().toString().padStart(2, "0") : "",
            minutes_endWorkingTime: resource.endWorkingTime ? new Date(resource.endWorkingTime).getUTCMinutes().toString().padStart(2, "0") : "",
            estimation: resource.estimation,
            prize: resource.prize,
            fine: resource.fine,
            comment: resource.comment || ""
        };

        reset(updatedFormData);
        setShowModal(true);
    }, [reset]);

    const user = useUser();

    const handleSelectSlot = ({ start }: { start: Date }) => {
        const clickedDate = new Date(start);
        const existingEvent = events.find(
            (event) =>
                new Date(event.start).toDateString() === clickedDate.toDateString()
        );

        if (!existingEvent) {
            // Example values, replace with actual user and report IDs
            const shiftReportId = location.state.ownerId;
            const userId = user.id;

            createDayShiftTrigger({
                shiftReportId,
                userId,
                workDate: clickedDate
            });
        } else {
            console.log("Event already exists for this day.");
        }
    };


    const updateTime = (baseDate: string, hours: string, minutes: string) => {
        const date = new Date(baseDate);
        date.setUTCHours(parseInt(hours, 10));
        date.setUTCMinutes(parseInt(minutes, 10));
        return date.toISOString();
    };

    const handleTimeChange = (
        field: "timeWorkedOut" | "startWorkingTime" | "endWorkingTime",
        type: "hours" | "minutes",
        value: string
    ) => {
        const fieldHours = `hours_${field}` as keyof typeof watchFields;
        const fieldMinutes = `minutes_${field}` as keyof typeof watchFields;

        const selectedDate = selectedEvent?.resource.workDate || new Date().toISOString();
        const startedTime = selectedDate.slice(0, 10);
        const endTime = selectedDate.slice(0, 10);

        setValue(type === "hours" ? fieldHours : fieldMinutes, value);

        const updatedHours = type === "hours" ? value : String(watchFields[fieldHours] || "00");
        const updatedMinutes = type === "minutes" ? value : String(watchFields[fieldMinutes] || "00");

        if (updatedHours !== "" && updatedMinutes !== "") {
            if (field === "startWorkingTime" && startedTime)
                setValue(field, updateTime(startedTime, updatedHours, updatedMinutes));
            else if (field === "endWorkingTime" && endTime)
                setValue(field, updateTime(endTime, updatedHours, updatedMinutes));
            else
                setValue(field, updatedHours.padStart(2, "0") + ":" + updatedMinutes.padStart(2, "0"));
        }
    };

    const handleModalSubmit = async () => {
        if (!selectedEvent) return;

        const result = await updateDay({
            id: selectedEvent.resource.dayShiftId || 0,
            typeWorkDay: typeWorkDay as TypeWorkDay,
            timeWorkedOut: watchFields["timeWorkedOut"],
            startWorkingTime: watchFields["startWorkingTime"] ? new Date(watchFields["startWorkingTime"]) : undefined,
            endWorkingTime: watchFields["endWorkingTime"] ? new Date(watchFields["endWorkingTime"]) : undefined,
            estimation: estimation as TypeEstimation,
            prize: Number(prize),
            fine: Number(fine),
            comment: comment
        });

        if (result) {
            if (result.typeWorkDay === "WORKING") {
                const name = workers.find((work) => work.value === result.workerId)?.name;
                const surname = workers.find((work) => work.value === result.workerId)?.surname;
                navigate("/finance/timesheet/view", {
                    state: {
                        ownerId: result.id,
                        posId: posId,
                        name: `${name} ${surname}`,
                        date: result.workDate,
                        status: result.status
                    }
                });
            }
            mutate([`get-shift-data`]);
            setShowModal(false);
        }
    };

    const handleAddEmployee = async () => {
        if (userId) {
            try {
                const result = await addWork({ userId: userId });
                if (result) {
                    mutate([`get-shift-data`]);
                    setShowAddEmployeeModal(false);
                    setUserId(0);
                }
            } catch (error) {
                console.error("Error adding worker:", error);
            }
        }
    };

    const CustomEvent = ({ event }: { event: ShiftEvent }) => {
        const resource = event.resource;

        return (
            <div className="flex flex-col h-full text-xs">
                <div className="font-medium truncate">{event.title}</div>
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                        {resource.estimation === "GROSS_VIOLATION" && <RedDot className="w-2 h-2" />}
                        {resource.estimation === "MINOR_VIOLATION" && <OrangeDot className="w-2 h-2" />}
                        {resource.estimation === "ONE_REMARK" && <GreenDot className="w-2 h-2" />}
                    </div>
                    <div className="flex space-x-1 text-xs">
                        {resource.prize && <span className="text-green-600">+{resource.prize}</span>}
                        {resource.fine && <span className="text-red-600">-{resource.fine}</span>}
                    </div>
                </div>
            </div>
        );
    };

    const CustomToolbar = (toolbar) => {
        return (
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => toolbar.onNavigate('PREV')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => toolbar.onNavigate('TODAY')}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        {t('dashboard.today')}
                    </button>
                    <button
                        onClick={() => toolbar.onNavigate('NEXT')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        ▶
                    </button>
                </div>

                <div className="text-lg font-semibold">
                    {toolbar.label}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => toolbar.onView(Views.MONTH)}
                        className={`px-3 py-1 rounded ${toolbar.view === Views.MONTH ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {t('dashboard.month')}
                    </button>
                    <button
                        onClick={() => toolbar.onView(Views.WEEK)}
                        className={`px-3 py-1 rounded ${toolbar.view === Views.WEEK ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {t('dashboard.week')}
                    </button>
                    <button
                        onClick={() => toolbar.onView(Views.DAY)}
                        className={`px-3 py-1 rounded ${toolbar.view === Views.DAY ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {t('finance.day')}
                    </button>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (shiftData?.workers?.length) {

            setPosId(shiftData.posId);
        }
    }, [shiftData, workers, poses]);

    return (
        <div className="h-full">
            {id !== 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{t('finance.scheduleCalendar')}</h2>
                        <button
                            onClick={() => setShowAddEmployeeModal(true)}
                            className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
                        >
                            <Icon icon="plus" className="w-5 h-5" />
                            <span>{t("finance.addE")}</span>
                        </button>
                    </div>

                    <div style={{ height: 600 }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            view={currentView}
                            onView={(view) => setCurrentView(view)}
                            date={currentDate}
                            onNavigate={setCurrentDate}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            components={{
                                event: CustomEvent,
                                toolbar: CustomToolbar
                            }}
                            messages={{
                                next: "Next",
                                previous: "Previous",
                                today: "Today",
                                month: "Month",
                                week: "Week",
                                day: "Day"
                            }}
                            dayLayoutAlgorithm="overlap"
                            step={60}
                            showMultiDayTimes
                        />
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 space-y-4">
                <div className="flex flex-wrap justify-center gap-x-10 sm:gap-x-5 gap-y-3">
                    <div className="flex space-x-2 items-center">
                        <RedDot />
                        <div className="text-text01">{t("finance.GROSS_VIOLATION")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <OrangeDot />
                        <div className="text-text01">{t("finance.MINOR_VIOLATION")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <GreenDot />
                        <div className="text-text01">{t("finance.ONE_REMARK")}</div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-10 sm:gap-x-5 gap-y-3">
                    <div className="flex space-x-2 items-center">
                        <div className="w-4 h-4 bg-[#DDF5FF] border border-[#0066cc]"></div>
                        <div className="text-text01">{t("finance.WORKING")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <div className="w-4 h-4 bg-[#f0f0f0] border border-[#ccc]"></div>
                        <div className="text-text01">{t("finance.WEEKEND")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <BN />
                        <div className="text-text01">{t("finance.MEDICAL")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <OTN />
                        <div className="text-text01">{t("finance.VACATION")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <O />
                        <div className="text-text01">{t("finance.TIMEOFF")}</div>
                    </div>
                    <div className="flex space-x-2 items-center">
                        <NP />
                        <div className="text-text01">{t("finance.TRUANCY")}</div>
                    </div>
                </div>
            </div>

            {/* Edit Shift Modal */}
            {selectedEvent && (
                <Modal isOpen={showModal} classname="max-h-[650px] px-8 py-8 overflow-y-auto">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text01">
                            {selectedEvent.resource.employeeName}, : {new Date(selectedEvent.resource.workDate).getDate()}
                        </h2>
                        <Close onClick={() => setShowModal(false)} className="cursor-pointer text-text01" />
                    </div>

                    <form onSubmit={handleSubmit(handleModalSubmit)} className="text-text02">
                        <DropdownInput
                            title={t("finance.day")}
                            {...register("typeWorkDay")}
                            value={typeWorkDay}
                            options={[
                                { name: t("finance.WORKING"), value: "WORKING" },
                                { name: t("finance.WEEKEND"), value: "WEEKEND" },
                                { name: t("finance.MEDICAL"), value: "MEDICAL" },
                                { name: t("finance.VACATION"), value: "VACATION" },
                                { name: t("finance.TIMEOFF"), value: "TIMEOFF" },
                                { name: t("finance.TRUANCY"), value: "TRUANCY" }
                            ]}
                            classname="w-80 sm:w-96 mb-4"
                            onChange={(value) => setValue("typeWorkDay", value)}
                            isDisabled={status === "SENT"}
                        />
                        {typeWorkDay === "WORKING" && (<div className="space-y-2">
                            <div>
                                <div>{t("finance.num")}</div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="00 ч"
                                        classname="w-[68px]"
                                        {...register("hours_timeWorkedOut", {
                                            required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                        })}
                                        value={watchFields["hours_timeWorkedOut"]}
                                        changeValue={(e) => handleTimeChange("timeWorkedOut", "hours", e.target.value)}
                                        error={!!errors.hours_timeWorkedOut}
                                        disabled={status === "SENT"}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="00 м"
                                        classname="w-[70px]"
                                        {...register("minutes_timeWorkedOut", {
                                            required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                        })}
                                        value={watchFields["minutes_timeWorkedOut"]}
                                        changeValue={(e) => handleTimeChange("timeWorkedOut", "minutes", e.target.value)}
                                        error={!!errors.minutes_timeWorkedOut}
                                        disabled={status === "SENT"}
                                    />
                                </div>
                                <div className="flex space-x-8 mt-2">
                                    <div>
                                        <div>{t("finance.start")}</div>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="00 ч"
                                                classname="w-[68px]"
                                                {...register("hours_startWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["hours_startWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("startWorkingTime", "hours", e.target.value)}
                                                error={!!errors.hours_startWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="00 м"
                                                classname="w-[70px]"
                                                {...register("minutes_startWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["minutes_startWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("startWorkingTime", "minutes", e.target.value)}
                                                error={!!errors.minutes_startWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div>{t("finance.endOf")}</div>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="00 ч"
                                                classname="w-[68px]"
                                                {...register("hours_endWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["hours_endWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("endWorkingTime", "hours", e.target.value)}
                                                error={!!errors.hours_endWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                            <Input
                                                type="number"
                                                placeholder="00 м"
                                                classname="w-[70px]"
                                                {...register("minutes_endWorkingTime", {
                                                    required: typeWorkDay === "WORKING" ? "Обязательное поле" : false,
                                                })}
                                                value={watchFields["minutes_endWorkingTime"]}
                                                changeValue={(e) => handleTimeChange("endWorkingTime", "minutes", e.target.value)}
                                                error={!!errors.minutes_endWorkingTime}
                                                disabled={status === "SENT"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-8">
                                <Input
                                    type="number"
                                    title={t("finance.prize")}
                                    classname="w-44"
                                    {...register("prize")}
                                    value={prize}
                                    changeValue={(e) => setValue("prize", e.target.value)}
                                    disabled={status === "SENT"}
                                />
                                <Input
                                    type="number"
                                    title={t("finance.fine")}
                                    classname="w-44"
                                    {...register("fine")}
                                    value={fine}
                                    changeValue={(e) => setValue("fine", e.target.value)}
                                    disabled={status === "SENT"}
                                />
                            </div>
                            <DropdownInput
                                title={t("finance.grade")}
                                {...register("estimation")}
                                value={estimation}
                                options={[
                                    { name: t("finance.NO_VIOLATION"), value: "NO_VIOLATION" },
                                    { name: t("finance.GROSS_VIOLATION"), value: "GROSS_VIOLATION" },
                                    { name: t("finance.MINOR_VIOLATION"), value: "MINOR_VIOLATION" },
                                    { name: t("finance.ONE_REMARK"), value: "ONE_REMARK" }
                                ]}
                                classname="w-80 sm:w-96"
                                onChange={(value) => setValue("estimation", value)}
                                isDisabled={status === "SENT"}
                            />
                            <MultilineInput
                                title={t("equipment.comment")}
                                {...register("comment")}
                                value={comment}
                                changeValue={(e) => setValue("comment", e.target.value)}
                                classname="w-80 sm:w-96"
                                // label={t("finance.desc")}
                                inputType="secondary"
                                disabled={status === "SENT"}
                            />
                        </div>)}
                        <div className="flex gap-3 mt-14">
                            <Button
                                title={t("warehouse.reset")}
                                handleClick={() => setShowModal(false)}
                                type="outline"
                            />
                            <Button
                                title={t("finance.openR")}
                                form={true}
                                isLoading={updatingDayShift}
                            />
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <Modal isOpen={showAddEmployeeModal} onClose={() => setShowAddEmployeeModal(false)} classname="w-[400px]" loading={addingWorker}>
                    <div className="flex flex-row items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text01">{t("finance.addNew")}</h2>
                        <Close onClick={() => setShowAddEmployeeModal(false)} className="cursor-pointer text-text01" />
                    </div>
                    <div className="mt-5">
                        <DropdownInput
                            value={userId}
                            options={workers}
                            onChange={handleAddEmployee}
                            classname="w-[292px]"
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ScheduleCalendar;
