import React, {useEffect, useMemo, useCallback, useState} from "react";
import { useTranslation } from "react-i18next";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWR from "swr";
import { useButtonCreate } from "@/components/context/useContext";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import { getShifts } from "@/services/api/finance";
import dayjs from "dayjs";
import 'dayjs/locale/ru';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from "@/utils/constants.ts";
import GeneralFilters from "@ui/Filter/GeneralFilters.tsx";

import {Calendar, dayjsLocalizer} from "react-big-calendar";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ShiftCreateModal, {ShiftFormData} from "@/pages/Finance/ShiftManagement/ShiftCreateModal.tsx";
import SearchFilter from "@ui/Filter/SearchFilter.tsx";
import {updateSearchParams} from "@/utils/updateSearchParams.ts";

interface FilterShifts {
    dateStart: Date;
    dateEnd: Date;
    posId: number | string;
    placementId: number | string;
    page?: number;
    size?: number;
}
dayjs.locale('ru');

const Timesheet: React.FC = () => {
    const { t } = useTranslation();
    const allCategoriesText = t("warehouse.all");
    // Set Russian locale globally

    // Configure localizer with Russian locale
    const localize = dayjsLocalizer(dayjs);

    // Russian messages for calendar
    const messages = {
        allDay: 'Весь день',
        previous: 'Назад',
        next: 'Вперёд',
        today: 'Сегодня',
        month: 'Месяц',
        week: 'Неделя',
        day: 'День',
        agenda: 'Повестка дня',
        date: 'Дата',
        time: 'Время',
        event: 'Событие',
        showMore: (total: number) => `+ ещё ${total}`,
        noEventsInRange: 'В этом диапазоне нет событий',
        work_week: 'Рабочая неделя'
    };

    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();


    const [searchParams, setSearchParams] = useSearchParams();


    const [totalCount, setTotalCount] = useState(0);

    const defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD HH:mm'); // "2025-07-01 00:00"
    const defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD HH:mm');     // "2025-07-31 23:59"



    const posId = Number(searchParams.get("posId") || "*");
    const dateStart = searchParams.get("dateStart") || defaultStartDate;
    const dateEnd = searchParams.get("dateEnd") || defaultEndDate;
    const placementId = searchParams.get("city") || "*";
    const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

    // Create stable initial filter
    const filterParams: FilterShifts = useMemo(() => ({
        dateStart: dayjs(dateStart).startOf("day").toDate(),
        dateEnd: dayjs(dateEnd).endOf("day").toDate(),
        currentPage,
        pageSize,
        posId,
        placementId
    }), [dateStart, dateEnd, posId, placementId, currentPage, pageSize]
    );

    const shouldFetch = Boolean(dateStart && dateEnd && posId);

    const { data: poses, isLoading: isPosLoading } = useSWR(
        `get-pos-${placementId}`,
        () =>
            getPoses({ placementId })
                .then((data) => data?.sort((a, b) => a.id - b.id) || [])
                .then((data) => {
                    const options = data.map((item) => ({
                        name: item.name,
                        value: item.id,
                    }));
                    const posesAllObj = { name: allCategoriesText, value: "*" };
                    return [posesAllObj, ...options];
                }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );


    // Create stable SWR key
    const swrKey = useMemo(() =>
        `get-shifts-${filterParams.posId}-${filterParams.placementId}-${filterParams.dateStart.toISOString()}-${filterParams.dateEnd.toISOString()}-${filterParams.page}-${filterParams.size}`,
        [filterParams]
    );


    useEffect(() => {
        console.log(shouldFetch);
    }, []);


    //Get All shifts
    const { data: shiftsData, isLoading: isShiftsLoading } = useSWR(
        shouldFetch ? swrKey: null,
        () => getShifts({
            posId: filterParams.posId === '*' ? filterParams.posId : Number(filterParams.posId),
            dateStart: filterParams.dateStart,
            dateEnd: filterParams.dateEnd
        }),
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            keepPreviousData: true
        }
    );


    useEffect(() => {
        console.log(shiftsData);
    }, [shiftsData]);



    useEffect(() => {
        if (buttonOn) {
            navigate("/finance/timesheet/creation", { state: { ownerId: 0 } });
        }
    }, [buttonOn, navigate]);





    const [openSlot, setOpenSlot] = useState(false)
    const [eventInfoModal, setEventInfoModal] = useState(false)
    const [currentEvent, setCurrentEvent] = useState(null)

    const handleSelectSlot = (event) => {
        setOpenSlot(true)
        setCurrentEvent(event)
    }

    const handleSelectEvent = (event) => {
        setCurrentEvent(event);
        if (event.resource?.type === 'shift') {
            // Handle shift event selection - could open shift details modal
            console.log('Selected shift:', event.resource);
            setEventInfoModal(true);
        } else {
            setEventInfoModal(true);
        }
    };

    const handleClose = () => {
        setOpenSlot(false)
    }


    const handleShiftCreate = (data: ShiftFormData) => {
        console.log(data)
        setOpenSlot(false)
    }

    // Transform shifts data to calendar events
    const calendarEvents = useMemo(() => {
        // If shiftsData is the direct array:
        if (!shiftsData || !Array.isArray(shiftsData)) {
            return [];
        }

        return shiftsData.map((shift) => {
            const startDate = dayjs(shift.props.startWorkingTime).toDate();
            const endDate = dayjs(shift.props.endWorkingTime).toDate();

            const posName = poses?.find(pos => pos.value === shift.props.posId)?.name || `Позиция ${shift.props.posId}`;

            return {
                id: shift.props.id,
                title: `${posName}`,
                start: startDate,
                end: endDate,
                resource: {
                    type: 'shift',
                    shiftId: shift.props.id,
                    posId: shift.props.posId,
                    createdById: shift.props.createdById,
                    workerId: shift.props.workerId,
                    status: shift.props.status
                }
            };
        });
    }, [shiftsData, poses]);






    return (
        <>
            <GeneralFilters
                poses={poses}
                count={totalCount}
                hideCity={false}
                hideSearch={true}
                hideReset={false}
            />

            <SearchFilter
                poses={poses}
                count={totalCount}
                loading={isPosLoading}
            />

            <div className="mt-8">
                <ShiftCreateModal
                    isOpen={openSlot}
                    onClose={handleClose}
                    onSubmit={handleShiftCreate}
                    employeeData={
                        {
                            organizationId: 1,
                            hrPositionId: '*',
                            placementId: '*'
                        }
                    }
                />
                <Calendar
                    localizer={localize}
                    events={calendarEvents}
                    messages={messages}
                    culture='ru'
                    style={{ height: '100vh' }}
                    defaultView='month'
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.resource?.type === 'shift' ? '#1890ff' : '#52c41a',
                            borderColor: event.resource?.type === 'shift' ? '#1890ff' : '#52c41a',
                            color: 'white'
                        }
                    })}
                    onNavigate={(date, view) => {
                        let start, end;

                        if (view === 'month') {
                            start = dayjs(date).startOf('month').startOf('week').format('YYYY-MM-DD HH:mm');
                            end = dayjs(date).endOf('month').endOf('week').format('YYYY-MM-DD HH:mm');
                            updateSearchParams(searchParams, setSearchParams, {
                                dateStart: start,
                                dateEnd: end,
                            })
                        }

                        return { start, end };
                    }}
                />

            </div>

        </>
    );
};

export default Timesheet;
