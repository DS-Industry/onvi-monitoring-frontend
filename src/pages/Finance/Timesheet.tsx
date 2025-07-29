import React, {useEffect, useMemo, useCallback, useState} from "react";
import { useTranslation } from "react-i18next";
import { getPoses, getWorkers } from "@/services/api/equipment";
import useSWR from "swr";
import { useButtonCreate } from "@/components/context/useContext";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";
import { getShifts } from "@/services/api/finance";
import dayjs from "dayjs";
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from "@/utils/constants.ts";
import GeneralFilters from "@ui/Filter/GeneralFilters.tsx";

import {Calendar, dayjsLocalizer} from "react-big-calendar";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ShiftCreateModal from "@/pages/Finance/ShiftManagement/ShiftCreateModal.tsx";

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

    const localize = dayjsLocalizer(dayjs)

    const { buttonOn } = useButtonCreate();
    const navigate = useNavigate();


    const [searchParams, setSearchParams] = useSearchParams();

    const formattedDate = dayjs().format("YYYY-MM-DD");

    const [totalCount, setTotalCount] = useState(0);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const posId = Number(searchParams.get("posId") || "*");
    const dateStart = searchParams.get("dateStart") || `${formattedDate} 00:00`;
    const dateEnd = searchParams.get("dateEnd") || `${formattedDate} 23:59`;
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

    const { data: poses } = useSWR(
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


    //Get All shifts
    const { data: shiftsData, isLoading: isShiftsLoading } = useSWR(
        swrKey,
        () => getShifts({
            posId: filterParams.posId,
            dateStart: filterParams.dateStart,
            dateEnd: filterParams.dateEnd
        }).then((data) => {
            console.log(data);
        }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true
        }
    );




    // const { data: workerData } = useSWR(
    //     [`get-worker`],
    //     () => getWorkers(),
    //     {
    //         revalidateOnFocus: false,
    //         revalidateOnReconnect: false,
    //         keepPreviousData: true
    //     }
    // );



    // const workers: { name: string; value: number; }[] = useMemo(() => {
    //     return workerData?.map((item) => ({ name: item.name, value: item.id })) || [];
    // }, [workerData]);

    useEffect(() => {
        if (buttonOn) {
            navigate("/finance/timesheet/creation", { state: { ownerId: 0 } });
        }
    }, [buttonOn, navigate]);

    // const shifts = useMemo(() => {
    //     return filter?.shiftReportsData.map((item) => ({
    //         ...item,
    //         posName: poses.find((pos) => pos.value === item.posId)?.name || "-",
    //         createdByName: workers.find((work) => work.value === item.createdById)?.name || "-"
    //     })) || [];
    // }, [filter?.shiftReportsData, poses, workers]);

    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Team Meeting',
            start: dayjs('2025-07-29 10:00').toDate(),
            end: dayjs('2025-07-29 11:00').toDate(),
            resource: 'meeting'
        },
        {
            id: 2,
            title: 'Project Deadline',
            start: dayjs('2025-07-31 09:00').toDate(),
            end: dayjs('2025-07-31 17:00').toDate(),
            resource: 'deadline'
        },
        {
            id: 3,
            title: 'Lunch with Client',
            start: dayjs('2025-08-01 12:00').toDate(),
            end: dayjs('2025-08-01 13:30').toDate(),
            resource: 'meeting'
        },
        {
            id: 4,
            title: 'Code Review',
            start: dayjs('2025-08-05 14:00').toDate(),
            end: dayjs('2025-08-05 15:30').toDate(),
            resource: 'review'
        }
    ]);

    const [openSlot, setOpenSlot] = useState(false)
    const [openShiftModal, setOpenShiftModal] = useState(false)
    const [eventInfoModal, setEventInfoModal] = useState(false)
    const [currentEvent, setCurrentEvent] = useState(null)

    const handleSelectSlot = (event) => {
        setOpenSlot(true)
        setCurrentEvent(event)
    }

    const handleSelectEvent = (event) => {
        setCurrentEvent(event)
        setEventInfoModal(true)
    }

    const handleClose = () => {
        setOpenSlot(false)
    }

    const onAddEvent = (e) => {
        e.preventDefault()
    }




    return (
        <>
            <GeneralFilters
                poses={poses}
                count={totalCount}
                hideCity={false}
                hideSearch={true}
                hideReset={false}
            />

            <div className="mt-8">
                <ShiftCreateModal isOpen={false} onClose={() => { return null}} onSubmit={() => { return null}} />
                <Calendar
                    localizer={localize}
                    events={events}
                    style={{ height: '100vh' }}
                    defaultView='week'
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable


                />

            </div>

        </>
    );
};

export default Timesheet;
