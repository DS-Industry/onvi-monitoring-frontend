import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPoses } from '@/services/api/equipment';
import useSWR from 'swr';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getShifts, TypeWorkDay } from '@/services/api/finance';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { getWorkers } from '@/services/api/hr';

import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ShiftCreateModal from '@/pages/Finance/ShiftManagement/ShiftCreateModal.tsx';
import { updateSearchParams } from '@/utils/searchParamsUtils';

import { Button, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useUser } from '@/hooks/useUserStore';

dayjs.locale('ru');

const Timesheet: React.FC = () => {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  // Configure localizer with Russian locale
  const localize = dayjsLocalizer(dayjs);

  // Russian messages for calendar
  const messages = {
    allDay: t('calendar.ALL_DAY', 'All day'), // fallback optional
    previous: t('calendar.BACK'),
    next: t('calendar.NEXT'),
    today: t('calendar.TODAY'),
    month: t('calendar.MONTH'),
    week: t('calendar.WEEK'),
    day: t('calendar.DAY'),
    agenda: t('calendar.AGENDA'),
    date: t('calendar.DATE', 'Date'),
    time: t('calendar.TIME', 'Time'),
    event: t('calendar.EVENT', 'Event'),
    showMore: (total: number) => `+ ${t('calendar.MORE', { count: total })}`,
    noEventsInRange: t(
      'calendar.NO_EVENTS',
      'There are no events in this range'
    ),
    work_week: t('calendar.WORK_WEEK', 'Work week'),
  };

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD HH:mm'); // "2025-07-01 00:00"
  const defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD HH:mm'); // "2025-07-31 23:59"

  const posId = Number(searchParams.get('posId')) || undefined;
  const dateStart = searchParams.get('dateStart') || defaultStartDate;
  const dateEnd = searchParams.get('dateEnd') || defaultEndDate;
  const placementId = Number(searchParams.get('city')) || undefined;
  const user = useUser();

  const shouldFetch = Boolean(dateStart && dateEnd && posId);

  const { data: poses, isLoading: isPosLoading } = useSWR(
    `get-pos-${placementId}`,
    () =>
      getPoses({ placementId: placementId })
        .then((data) => data?.sort((a, b) => a.id - b.id) || [])
        .then((data) => {
          const options = data.map((item) => ({
            label: item.name,
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

  //Get All shifts
  const {
    data: shiftsData,
    mutate: refetchShifts,
    isLoading: isLoadingShifts,
  } = useSWR(
    shouldFetch ? ['get-shifts', dateStart, dateEnd, posId] : null,
    () =>
      getShifts({
        posId: posId || 0,
        dateStart: new Date(dateStart),
        dateEnd: new Date(dateEnd),
      }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    }
  );

  const { data: employees } = useSWR(
    user.organizationId ? [`get-workers`, user.organizationId] : null,
    () =>
      getWorkers({
        organizationId: user.organizationId,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const [openSlot, setOpenSlot] = useState(false);

  const handleSelectSlot = useCallback(() => {
    if (!posId) {
      message.error(t('validation.posRequired'));
      return;
    }
    setOpenSlot(true);
  }, []);

  const handleClose = () => {
    setOpenSlot(false);
  };

  const handleCreateEvent = () => {
    if (!posId) {
      message.error(t('validation.posRequired'));
      return;
    }
    setOpenSlot(true);
  };

  // Transform shifts data to calendar events
  const calendarEvents = useMemo(() => {
    // If shiftsData is the direct array:
    if (!shiftsData || !Array.isArray(shiftsData) || !employees) {
      return [];
    }

    return shiftsData.map(shift => {
      const startDate = dayjs(shift.props.startWorkingTime).toDate();
      const endDate = dayjs(shift.props.endWorkingTime).toDate();

      return {
        id: shift.props.id,
        title: `${employees.find(emp => emp.props.id === shift.props.workerId)?.props
          ?.name || 'Неизвестный работник'
          }`,
        start: startDate,
        end: endDate,
        resource: {
          type: TypeWorkDay[
            shift.props.typeWorkDay as keyof typeof TypeWorkDay
          ],
          shiftId: shift.props.id,
          posId: shift.props.posId,
          createdById: shift.props.createdById,
          workerId: shift.props.workerId,
          status: shift.props.status,
        },
      };
    });
  }, [shiftsData, poses, employees]);

  const handleSelectEvent = (event: (typeof calendarEvents)[0]) => {
    if (event.resource?.type === TypeWorkDay.WORKING) {
      navigate(
        `/finance/timesheet/view?id=${event.resource.shiftId}&posId=${event.resource.posId}`
      );
    }
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.employee')}
          </span>
        </div>
      </div>
      <div className='mb-5'>
        <div className={`flex flex-col`}>
          <label className="text-sm text-text02">{t('analysis.posId')}</label>
          <Select
            className="w-full sm:w-80"
            placeholder="Выберите объект"
            options={poses || []}
            value={posId}
            onChange={value => {
              updateSearchParams(searchParams, setSearchParams, {
                posId: value
              });
            }}
            loading={isPosLoading}
            allowClear={true}
            onClear={() => {
              updateSearchParams(searchParams, setSearchParams, {
                posId: undefined
              });
            }}
          />
        </div>
      </div>
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateEvent}
          className="bg-blue-500 hover:bg-blue-600 h-[35px]"
        >
          {t('shift.createShift')}
        </Button>
      </div>

      <div className="mt-8">
        <ShiftCreateModal
          isOpen={openSlot}
          onClose={handleClose}
          onSubmit={refetchShifts}
          employeeData={{
            organizationId: user.organizationId,
          }}
        />
        <div
          className={`${isLoadingShifts ? 'pointer-events-none opacity-30' : ''
            }`}
        >
          <Calendar
            localizer={localize}
            events={calendarEvents}
            messages={messages}
            culture={currentLanguage}
            style={{ height: '100vh' }}
            defaultView="month"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={event => ({
              style: {
                backgroundColor:
                  event.resource?.type === TypeWorkDay.WORKING
                    ? '#1890ff'
                    : '#52c41a',
                borderColor:
                  event.resource?.type === TypeWorkDay.WORKING
                    ? '#1890ff'
                    : '#52c41a',
                color: 'white',
              },
            })}
            onNavigate={(date, view) => {
              let start, end;

              if (view === 'month') {
                start = dayjs(date)
                  .startOf('month')
                  .startOf('week')
                  .format('YYYY-MM-DD HH:mm');
                end = dayjs(date)
                  .endOf('month')
                  .endOf('week')
                  .format('YYYY-MM-DD HH:mm');
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
