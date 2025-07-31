import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPoses } from "@/services/api/equipment";
import useSWR from "swr";
import { useButtonCreate } from "@/components/context/useContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createDayShift,
  CreateDayShiftBody,
  getShifts,
} from "@/services/api/finance";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/utils/constants.ts";

import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ShiftCreateModal, {
  ShiftFormData,
} from "@/pages/Finance/ShiftManagement/ShiftCreateModal.tsx";
import SearchFilter from "@ui/Filter/SearchFilter.tsx";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import useSWRMutation from "swr/mutation";
import { message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface FilterShifts {
  dateStart: Date;
  dateEnd: Date;
  posId: number;
  placementId: number | string;
  page?: number;
  size?: number;
}
dayjs.locale("ru");

const Timesheet: React.FC = () => {
  const { t } = useTranslation();

  // Configure localizer with Russian locale
  const localize = dayjsLocalizer(dayjs);

  // Russian messages for calendar
  const messages = {
    allDay: "Весь день",
    previous: "Назад",
    next: "Вперёд",
    today: "Сегодня",
    month: "Месяц",
    week: "Неделя",
    day: "День",
    agenda: "Повестка дня",
    date: "Дата",
    time: "Время",
    event: "Событие",
    showMore: (total: number) => `+ ещё ${total}`,
    noEventsInRange: "В этом диапазоне нет событий",
    work_week: "Рабочая неделя",
  };

  const { buttonOn } = useButtonCreate();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const defaultStartDate = dayjs().startOf("month").format("YYYY-MM-DD HH:mm"); // "2025-07-01 00:00"
  const defaultEndDate = dayjs().endOf("month").format("YYYY-MM-DD HH:mm"); // "2025-07-31 23:59"

  const posId = Number(searchParams.get("posId") || "*");
  const dateStart = searchParams.get("dateStart") || defaultStartDate;
  const dateEnd = searchParams.get("dateEnd") || defaultEndDate;
  const placementId = searchParams.get("city") || "*";
  const currentPage = Number(searchParams.get("page") || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get("size") || DEFAULT_PAGE_SIZE);

  // Create stable initial filter
  const filterParams: FilterShifts = useMemo(
    () => ({
      dateStart: dayjs(dateStart).startOf("day").toDate(),
      dateEnd: dayjs(dateEnd).endOf("day").toDate(),
      currentPage,
      pageSize,
      posId,
      placementId,
    }),
    [dateStart, dateEnd, posId, placementId, currentPage, pageSize]
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

          return options;
        }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: createShift } = useSWRMutation(
    ["create-employee-shift"],
    async (_, { arg }: { arg: CreateDayShiftBody }) => {
      return createDayShift(arg);
    }
  );

  // Create stable SWR key
  const swrKey = useMemo(
    () =>
      `get-shifts-${filterParams.posId}-${
        filterParams.placementId
      }-${filterParams.dateStart.toISOString()}-${filterParams.dateEnd.toISOString()}-${
        filterParams.page
      }-${filterParams.size}`,
    [filterParams]
  );

  //Get All shifts
  const {
    data: shiftsData,
    mutate: refetchShifts,
    isLoading: isLoadingShifts,
  } = useSWR(
    shouldFetch ? swrKey : null,
    () =>
      getShifts({
        posId: filterParams.posId,
        dateStart: filterParams.dateStart,
        dateEnd: filterParams.dateEnd,
      }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (buttonOn) {
      navigate("/finance/timesheet/creation", { state: { ownerId: 0 } });
    }
  }, [buttonOn, navigate]);

  const [openSlot, setOpenSlot] = useState(false);

  const handleSelectSlot = useCallback(() => {
    setOpenSlot(true);
  }, []);

  const handleClose = () => {
    setOpenSlot(false);
  };

  const handleCreateEvent = () => {
    setOpenSlot(true);
  };

  const handleShiftCreate = async (data: ShiftFormData) => {
    const shiftData: CreateDayShiftBody = {
      workerId: data.userId,
      posId: typeof posId === "string" ? parseInt(posId) : posId,
      workDate: dayjs(data.startDate).toDate(),
      typeWorkDay: data.workType,
      startWorkingTime: dayjs(data.startDate).toDate(),
      endWorkingTime: dayjs(data.endDate).toDate(),
    };

    try {
      await createShift(shiftData);
      message.success(t("finance.operationCreated"));
      // Refetch shifts data to show the new event
      await refetchShifts();
      setOpenSlot(false);
    } catch (error: any) {
      message.error(t("errors.submitFailed"));
      console.error("Error creating shift:", error);
    }
  };

  // Transform shifts data to calendar events
  const calendarEvents = useMemo(() => {
    // If shiftsData is the direct array:
    if (!shiftsData || !Array.isArray(shiftsData)) {
      return [];
    }

    return shiftsData.map((shift) => {
      const startDate = dayjs(shift.props.startWorkingTime).toDate();
      const endDate = dayjs(shift.props.endWorkingTime).toDate();

      const posName =
        poses?.find((pos) => pos.value === shift.props.posId)?.name ||
        `Позиция ${shift.props.posId}`;

      return {
        id: shift.props.id,
        title: `${posName}`,
        start: startDate,
        end: endDate,
        resource: {
          type: "shift",
          shiftId: shift.props.id,
          posId: shift.props.posId,
          createdById: shift.props.createdById,
          workerId: shift.props.workerId,
          status: shift.props.status,
        },
      };
    });
  }, [shiftsData, poses]);

  const handleSelectEvent = (event: (typeof calendarEvents)[0]) => {
    if (event.resource?.type === "shift") {
      navigate(
        `/finance/timesheet/view?id=${event.resource.shiftId}&posId=${event.resource.posId}`
      );
    }
  };

  return (
    <>
      <SearchFilter poses={poses} loading={isPosLoading} />

      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateEvent}
          className="bg-blue-500 hover:bg-blue-600 h-[35px]"
        >
          {t("shift.createShift")}
        </Button>
      </div>

      <div className="mt-8">
        <ShiftCreateModal
          isOpen={openSlot}
          onClose={handleClose}
          onSubmit={handleShiftCreate}
          employeeData={{
            organizationId: 1,
            hrPositionId: "*",
            placementId: "*",
          }}
        />
        <div
          className={`${
            isLoadingShifts ? "pointer-events-none opacity-30" : ""
          }`}
        >
          <Calendar
            localizer={localize}
            events={calendarEvents}
            messages={messages}
            culture="ru"
            style={{ height: "100vh" }}
            defaultView="month"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  event.resource?.type === "shift" ? "#1890ff" : "#52c41a",
                borderColor:
                  event.resource?.type === "shift" ? "#1890ff" : "#52c41a",
                color: "white",
              },
            })}
            onNavigate={(date, view) => {
              let start, end;

              if (view === "month") {
                start = dayjs(date)
                  .startOf("month")
                  .startOf("week")
                  .format("YYYY-MM-DD HH:mm");
                end = dayjs(date)
                  .endOf("month")
                  .endOf("week")
                  .format("YYYY-MM-DD HH:mm");
                updateSearchParams(searchParams, setSearchParams, {
                  dateStart: start,
                  dateEnd: end,
                });
              }

              return { start, end };
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Timesheet;
