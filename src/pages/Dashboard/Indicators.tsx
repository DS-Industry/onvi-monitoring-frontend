import React, { useState } from "react";
import TotalVisitorsIcon from "@icons/total-visitors.svg?react";
import ProfitIcon from "@icons/profit.svg?react";
import TotalDownTimeIcon from "@icons/total-downtime.svg?react";
import Notification from "@ui/Notification";
import LineChart from "@ui/LineChart";
// import DatePickerComponent from "@ui/DatePickerComponent";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData";
import useSWR from "swr";
import { getStatistic } from "@/services/api/organization";
import { getDepositPos } from "@/services/api/pos";
// import DropdownInput from "@ui/Input/DropdownInput";
import TableSkeleton from "../../components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";
import { getPoses } from "@/services/api/equipment";
import { useCity, useEndDate, usePosType, useStartDate } from "@/hooks/useAuthStore";
import DynamicTable from "../../components/ui/Table/DynamicTable";
import { Card, Row, Col, Typography, Space, Button, Select, DatePicker, Grid } from "antd";
const { Text, Title } = Typography;
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

interface PosMonitoring {
  id: number;
  name: string;
  city: string;
  counter: number;
  cashSum: number;
  virtualSum: number;
  yandexSum: number;
  mobileSum: number;
  cardSum: number;
  lastOper: Date;
  discountSum: number;
  cashbackSumCard: number;
  cashbackSumMub: number;
}

interface Statistic {
  cars: number;
  sum: number;
}

// const selectOptions: {
//   value: string;
//   name: string;
// }[] = [
//     { value: "last_7_days", name: "Последние 7 дней" },
//     { value: "last_30_days", name: "Последние 30 дней" },
//     { value: "last_90_days", name: "Последние 90 дней" },
//     { value: "last_month", name: "Последний месяц" },
//     { value: "last_year", name: "Последний год" },
//   ];

const durations: { label: string; value: "today" | "week" | "month" }[] = [
  { label: "Today", value: "today" },
  { label: "For a week", value: "week" },
  { label: "For a month", value: "month" },
];

// const tableHeader: string[] = [
//   "id",
//   "Наименование",
//   "Город",
//   "Адрес",
//   "Инкассация за сегодня",
//   "Инкассация за месяц",
//   "Операций за сегодня",
//   "Безнал. операций за сегодня",
// ];

const Indicators: React.FC = () => {
  const posType = usePosType();
  const { RangePicker } = DatePicker;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [notificationVisible, setNotificationVisible] = useState(true);
  const [selectedValue, setSelectedValue] = useState(posType);
  const startDate = useStartDate();
  const endDate = useEndDate();
  const [dateRange, setDateRange] = useState({
    dateStart: startDate,
    dateEnd: endDate,
  });
  const { t } = useTranslation();
  const city = useCity();
  const [activeDuration, setActiveDuration] = useState<"today" | "week" | "month" | null>(null);

  const { data } = useSWR(['get-statistic'], () => getStatistic());

  const { data: filter, isLoading: filterLoading } = useSWR(['get-pos-deposits', dateRange, selectedValue], () => getDepositPos({
    ...dateRange,
    posId: selectedValue,
    placementId: city
  }));

  const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const posMonitoring: PosMonitoring[] = filter?.map((item: PosMonitoring) => {
    return item;
  }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

  const statisticData: Statistic = data || { cars: 0, sum: 0 };

  const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

  const cards = [
    {
      title: "visitors",
      number: statisticData ? statisticData.cars : 0,
      unit: "",
      icon: TotalVisitorsIcon,
      isPositive: true,
      percentage: "12",
      day: "К предыдущему дню",
    },
    {
      title: "profit",
      number: statisticData ? statisticData.sum : 0,
      unit: "₽",
      icon: ProfitIcon,
      isPositive: true,
      percentage: "15",
      day: "К предыдущему дню",
    },
    {
      title: "downtime",
      number: 7,
      unit: "мин",
      icon: TotalDownTimeIcon,
      isPositive: true,
      percentage: "15",
      day: "К предыдущему дню",
    },
  ];

  // const handleDateChange = (newDateRange: { startDate: Date | null; endDate: Date | null }) => {
  //   setDateRange({
  //     dateStart: newDateRange.startDate || new Date(),
  //     dateEnd: newDateRange.endDate || new Date(),
  //   });
  // };

  // Handle duration click
  const handleDurationClick = (duration: "today" | "week" | "month") => {
    const now = new Date();
    let newDateStart: Date = now;

    if (duration === "today") {
      newDateStart = new Date(now.toISOString().slice(0, 10)); // Start of today
    } else if (duration === "week") {
      newDateStart = new Date();
      newDateStart.setDate(now.getDate() - 7); // Last 7 days
    } else if (duration === "month") {
      newDateStart = new Date();
      newDateStart.setMonth(now.getMonth() - 1); // Last month
    }

    setDateRange({
      dateStart: newDateStart,
      dateEnd: now,
    });
    setActiveDuration(duration);
  };

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange({
        dateStart: start?.toDate() || new Date(),
        dateEnd: end?.toDate() || new Date(),
      });
      // Clear active duration button selection when date range is manually selected
      setActiveDuration(null);
    }
  };

  return (
    <>
      {notificationVisible && (
        <Notification
          title={t("indicators.notification")}
          message={t("indicators.notificationText")}
          onClose={() => setNotificationVisible(false)}
          link={""}
          linkUrl={""}
        />
      )}
      <div className="grid gap-4">
        {/* Cards Section */}
        <Row gutter={[24, 24]}>
          {cards.map((item) => (
            <Col xs={24} md={12} lg={8} key={item.title}>
              <Card
                variant="borderless"
                styles={{
                  body: {
                    padding: 24,
                    borderRadius: 24,
                    backgroundColor: "#fff",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)", // mimic `shadow-card`
                  },
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>{t(`indicators.${item.title}`)}</Text>
                    <Title level={2} style={{ margin: 0, color: "#202224" }}>
                      {item.number} {item.unit}
                    </Title>
                  </div>
                  <item.icon />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Revenue Section */}
        <div className="mt-4 py-3 lg:py-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl px-3 lg:px-8">
            {t("indicators.revenue")}
          </p>
          <div className="w-full h-64 lg:h-96 overflow-auto px-3 lg:px-8">
            <LineChart />
          </div>
        </div>

        {/* Revenue Report Section */}
        <div className="mt-4 py-3 lg:py-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl px-3 lg:px-8">
            {t("indicators.revReport")}
          </p>
          <Row justify="space-between" align="middle" wrap gutter={[16, 16]} style={{ marginBottom: '4px', padding: "20px" }}>
            <Col xs={24} lg={16}>
              <Space wrap>
                <div>
                  <Select
                    className="w-80"
                    placeholder="Выберите объект"
                    options={poses.map((item) => ({ label: item.name, value: item.value }))}
                    value={selectedValue}
                    onChange={setSelectedValue}
                    dropdownRender={(menu) => (
                      <div style={{ maxHeight: 100, overflowY: "auto" }}>
                        {menu}
                      </div>
                    )}
                  />
                </div>
                {durations.map((duration) => (
                  <Button
                    key={duration.value}
                    type={activeDuration === duration.value ? "primary" : "default"}
                    shape="round"
                    onClick={() => handleDurationClick(duration.value)}
                  >
                    {duration.label}
                  </Button>
                ))}
              </Space>
            </Col>
            <Col xs={24} lg={8}>
              {screens.xs ? (
                // Mobile view: Two separate DatePickers for better mobile experience
                <Space direction="vertical" style={{ width: '100%' }}>
                  <DatePicker
                    placeholder="Start date"
                    value={dayjs(dateRange.dateStart)}
                    onChange={(date) => {
                      if (date) {
                        setDateRange({
                          ...dateRange,
                          dateStart: date.toDate(),
                        });
                        setActiveDuration(null);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                  <DatePicker
                    placeholder="End date"
                    value={dayjs(dateRange.dateEnd)}
                    onChange={(date) => {
                      if (date) {
                        setDateRange({
                          ...dateRange,
                          dateEnd: date.toDate(),
                        });
                        setActiveDuration(null);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                </Space>
              ) : (
                // Desktop view: RangePicker
                <RangePicker
                  onChange={handleDateRangeChange}
                  value={[
                    dayjs(dateRange.dateStart),
                    dayjs(dateRange.dateEnd)
                  ]}
                  allowClear={false}
                  style={{ width: '100%' }}
                />
              )}
            </Col>
          </Row>
          <div className="overflow-x-auto">
            {filterLoading ? (
              <TableSkeleton columnCount={columnsMonitoringPos.length} />
            ) : (
              <DynamicTable
                data={posMonitoring}
                columns={columnsMonitoringPos}
                isDisplayEdit={true}
                navigableFields={[{ key: "name", getPath: () => '/station/enrollments/devices' }]}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Indicators;
