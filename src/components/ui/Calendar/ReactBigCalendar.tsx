import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
    Calendar as BigCalendar,
    Views,
    dayjsLocalizer,
    SlotInfo
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import useSWR from "swr";
import {
    getShiftById,
    createDayShift,
    updateDayShift,
    TypeWorkDay,
    TypeEstimation,
    UpdateDayShiftBody,
    addWorker,
} from "@/services/api/finance";
import EditShiftModal from "./EditShiftModal";
import { useUser } from "@/hooks/useUserStore";
import RedDot from "@icons/RedDot.svg?react";
import OrangeDot from "@icons/OrangeDot.svg?react";
import GreenDot from "@icons/GreenDot.svg?react";
import BN from "@icons/Бл.svg?react";
import OTN from "@icons/ОТП.svg?react";
import O from "@icons/О.svg?react";
import NP from "@icons/Пр.svg?react";
import { useTranslation } from "react-i18next";
import CustomEvent from "./CustomEvent"
import { useNavigate } from "react-router-dom";
import { getWorkers } from "@/services/api/equipment";
import { usePosType } from "@/hooks/useAuthStore";
import CustomSlotWrapper from "./CustomSlotWrapper";
import CustomToolbar from "./CustomToolbar";

const localizer = dayjsLocalizer(dayjs);

export interface CalendarEvent {
    id: number;
    title: string;
    startWorkingTime: Date;
    endWorkingTime: Date;
    timeWorkedOut: string;
    workerId: number;
    name: string;
    typeWorkDay?: TypeWorkDay;
    estimation?: TypeEstimation | null;
    prize?: number | null;
    fine?: number | null;
    comment?: string;
}

type Props = {
    shiftReportId: number;
};

const ReactBigCalendar: React.FC<Props> = ({ shiftReportId }) => {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const posType = usePosType();
    const [posId, setPosId] = useState(posType);

    const { data: shiftData, mutate } = useSWR(
        `/api/shift-report/${shiftReportId}`,
        () => getShiftById(shiftReportId)
    );

    const user = useUser();

    // Populate calendarEvents from shiftData
    useEffect(() => {
        if (!shiftData) return;

        const mappedEvents: CalendarEvent[] = shiftData.workers.flatMap((worker) =>
            worker.workDays
                .filter((d) => d.startWorkingTime && d.endWorkingTime)
                .map((d) => ({
                    id: d.workDayId,
                    title: d.typeWorkDay === TypeWorkDay.WORKING ? `${d.timeWorkedOut}` : "",
                    startWorkingTime: dayjs(d.startWorkingTime!).toDate(),
                    endWorkingTime: dayjs(d.endWorkingTime!).toDate(),
                    timeWorkedOut: d.timeWorkedOut ?? "",
                    workerId: worker.workerId,
                    name: `${worker.name} ${worker.surname}`,
                    typeWorkDay: d.typeWorkDay,
                    estimation: d.estimation,
                    prize: d.prize ?? null,
                    fine: d.fine ?? null,
                    comment: d.comment ?? "",
                }))
        );
        setPosId(shiftData.posId);
        setCalendarEvents(mappedEvents);
    }, [shiftData]);

    const handleSelectSlot = useCallback(
        async ({ start, end }: SlotInfo) => {
            if (!shiftData) return;

            const userId = user.id;

            try {
                const created = await createDayShift({
                    shiftReportId,
                    userId,
                    workDate: dayjs(start).startOf("day").toDate(),
                });

                const worker = shiftData.workers.find(w => w.workerId === userId);
                const name = worker ? `${worker.name} ${worker.surname}` : "User";

                const newEvent: CalendarEvent = {
                    id: created.id,
                    title: "",
                    startWorkingTime: start,
                    endWorkingTime: end,
                    timeWorkedOut: "",
                    workerId: userId,
                    name: name,
                    typeWorkDay: TypeWorkDay.WEEKEND,
                    estimation: null,
                    prize: null,
                    fine: null,
                    comment: "",
                };

                setSelectedEvent(newEvent);
                setModalOpen(true);

            } catch (e) {
                console.error("Shift creation failed", e);
            }
        },
        [shiftData, user.id, shiftReportId]
    );

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const navigate = useNavigate();

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true
    });

    const workers = useMemo(() => {
        return workerData?.map((item) => ({
            name: item.name,
            value: item.id,
            surname: item.surname
        })) || [];
    }, [workerData]);

    const handleModalSubmit = async (payload: UpdateDayShiftBody) => {
        if (!selectedEvent) return;

        const result = await updateDayShift(payload, selectedEvent.id);

        if (result.typeWorkDay === TypeWorkDay.WORKING) {
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

        const updated: CalendarEvent = {
            ...selectedEvent,
            ...payload,
        };

        setCalendarEvents(prev =>
            prev.some((e) => e.id === updated.id)
                ? prev.map((e) => (e.id === updated.id ? updated : e))
                : [...prev, updated]
        );

        setModalOpen(false);
    };

    const calendarRange = useMemo(() => {
        if (!shiftData) return {};
        return {
            defaultDate: dayjs(shiftData.startDate).toDate(),
            min: dayjs(shiftData.startDate).toDate(),
            max: dayjs(shiftData.endDate).toDate(),
        };
    }, [shiftData]);

    const handleAddWorkerSubmit = async (userId: number) => {
        try {
            await addWorker({ userId }, shiftReportId);
            mutate();
        } catch (e) {
            console.error("Failed to add worker:", e);
        }
    };

    const handleSlotAddEvent = async (date: Date) => {
        const start = dayjs(date).toDate();
        const end = dayjs(date).toDate();

        await handleSelectSlot({ start, end } as SlotInfo); // reuse existing logic
    };

    return (
        <div>
            <div className="p-4 bg-white rounded shadow-lg h-[600px] relative">
                <BigCalendar
                    localizer={localizer}
                    events={calendarEvents.map((event) => ({
                        ...event,
                        start: event.startWorkingTime,
                        end: event.endWorkingTime,
                    }))}
                    defaultView={Views.WEEK}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    style={{ height: "100%" }}
                    {...calendarRange}
                    components={{
                        toolbar: CustomToolbar,
                        event: CustomEvent,
                        dateCellWrapper: (props: any) => (
                            <CustomSlotWrapper
                                value={props.value}
                                onAddEvent={(date) => handleSlotAddEvent(date)}
                            >
                                {props.children}
                            </CustomSlotWrapper>
                        )
                    }}
                    eventPropGetter={(event: CalendarEvent) => {
                        if (event.typeWorkDay === TypeWorkDay.WORKING) {
                            return {
                                style: {
                                    backgroundColor: "#DDF5FF",
                                    border: "1px solid #0066cc",
                                    color: "#000",
                                },
                            };
                        } else if (event.typeWorkDay === TypeWorkDay.WEEKEND) {
                            return {
                                style: {
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #0066cc",
                                    color: "#000",
                                },
                            };
                        } else {
                            return {
                                style: {
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #0066cc",
                                    color: "#000",
                                },
                            };
                        }

                        return {}; // default styling for other types
                    }}
                />
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

                {modalOpen && selectedEvent && (
                    <EditShiftModal
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        event={selectedEvent}
                        onSubmit={handleModalSubmit}
                        workers={workers}
                        onSubmitWorker={handleAddWorkerSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default ReactBigCalendar;
