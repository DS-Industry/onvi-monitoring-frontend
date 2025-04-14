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
import DropdownInput from "@ui/Input/DropdownInput";
import TableSkeleton from "../../components/ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";
import { getPoses } from "@/services/api/equipment";
import { useCity, useEndDate, usePosType, useStartDate } from "@/hooks/useAuthStore";
import DynamicTable from "../../components/ui/Table/DynamicTable";
import { Card, Row, Col, Typography } from "antd";
const { Text, Title } = Typography;

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

  const { data } = useSWR(['get-statistic'], () => getStatistic());

  const { data: filter, isLoading: filterLoading } = useSWR(['get-pos-deposits', dateRange, selectedValue], () => getDepositPos({
    ...dateRange,
    posId: posType,
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
          <div className="flex flex-col lg:flex-row justify-between px-3 lg:px-8 gap-4">
            <DropdownInput
              inputType="primary"
              label="Все автомойки"
              options={poses}
              value={selectedValue}
              onChange={setSelectedValue}
              isSelectable={true}
              classname="mt-3"
            />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-3 md:mt-0">
              {durations?.map((duration) => (
                <button
                  key={duration.label}
                  onClick={() => handleDurationClick(duration.value)}
                  className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-2"
                >
                  {duration.label}
                </button>
              ))}
              {/* <DatePickerComponent
                onDateChange={(range) =>
                  handleDateChange({
                    startDate: range?.startDate,
                    endDate: range?.endDate,
                  })
                }
              /> */}
            </div>
          </div>
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
