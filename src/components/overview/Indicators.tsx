import React, { useState } from "react";
import TotalVisitorsIcon from "@icons/total-visitors.svg?react";
import ProfitIcon from "@icons/profit.svg?react";
import TotalDownTimeIcon from "@icons/total-downtime.svg?react";
import Notification from "@ui/Notification";
import LineChart from "@ui/LineChart";
import DatePickerComponent from "@ui/DatePickerComponent";
import { columnsMonitoringPos } from "@/utils/OverFlowTableData";
import useSWR from "swr";
import { getStatistic } from "@/services/api/organization";
import { getDepositPos } from "@/services/api/pos";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import DropdownInput from "@ui/Input/DropdownInput";
import TableSkeleton from "../ui/Table/TableSkeleton";
import { useTranslation } from "react-i18next";
import { getPoses } from "@/services/api/equipment";
import { useEndDate, usePosType, useStartDate } from "@/hooks/useAuthStore";

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

  const { data } = useSWR(['get-statistic'], () => getStatistic());

  const { data: filter, isLoading: filterLoading } = useSWR(['get-pos-deposits', dateRange, selectedValue], () => getDepositPos({
    ...dateRange,
    posId: selectedValue
}));

  const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

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

  const handleDateChange = (newDateRange: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange({
      dateStart: newDateRange.startDate || new Date(),
      dateEnd: newDateRange.endDate || new Date(),
    });
  };

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
        <div className="lg:flex space-y-6 lg:space-y-0 lg:space-x-6">
          {cards.map((item) => (
            <div
              className="p-2 lg:p-4 bg-white shadow-card rounded-[18px] "
              key={item.title}
            >
              <div className="flex justify-between lg:justify-normal lg:space-x-4 mb-5">
                <div>
                  <p className="text-sm lg:text-base font-semibold">
                    {t(`indicators.${item.title}`)}
                  </p>
                  <p className="text-xl lg:text-3xl font-bold text-[#202224]">
                    {item.number} {item.unit}
                  </p>
                </div>
                <item.icon />
              </div>
              {/*
              <p className="text-sm lg:text-base text-text03 flex">
                {item.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <span
                  className={`mx-2 ${
                    item.isPositive ? "text-successFill" : "text-errorFill"
                  }`}
                >
                  {item.percentage}%
                </span>
                {item.day}
              </p>
              */}
            </div>
          ))}
        </div>

        <div className="mt-4 py-3 lg:py-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl px-3 lg:px-8">
            {t("indicators.revenue")}
          </p>
          <div className="lg:flex justify-between px-3 lg:px-8">
            <DropdownInput
              inputType="primary"
              label="Все автомойки"
              options={poses}
              value={selectedValue}
              onChange={setSelectedValue}
              isSelectable={true}
              classname="mt-3"
            />
            <div className="flex md:flex-row flex-col space-y-3 md:space-y-0 mt-3 md:mt-3">
              {durations.map((duration) => (
                <button
                  key={duration.label}
                  className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-2 mx-2"
                >
                  {duration.label}
                </button>
              ))}
              <DatePickerComponent />
            </div>
          </div>
          <div className="w-full h-64 lg:h-96 overflow-x-hidden overflow-y-hidden px-3 lg:px-8">
            <LineChart />
          </div>
        </div>
        {/*
        <div className="mt-4 py-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl mb-8 px-3 lg:px-8">
            Отчет по выручке
          </p>
          <div className="lg:flex justify-between mb-8 px-3 lg:px-8">
            <select
              id="countries"
              className="bg-[#F7F9FC] border border-text03/30 text-text01 text-sm rounded-md focus:ring-text03 focus:border-text03 block md:w-64 p-2.5 outline-none"
            >
              <option selected>Choose a country</option>
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex md:flex-row flex-col space-y-3 md:space-y-0 mt-3 md:mt-3">
              {durations.map((duration) => (
                <button className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-1 mx-2">
                  {duration.label}
                </button>
              ))}
              <DatePickerComponent />
            </div>
          </div>
           <table className="w-full text-sm border-b">
            <thead>
              <tr className="">
                {tableHeader.map((header) => (
                  <th
                    key={header}
                    className="border border-white py-5 px-2 bg-background06"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-5 px-2">00001</td>
                <td className="py-5 px-2">Мойка_1</td>
                <td className="py-5 px-2">Ростов-на-Дону</td>
                <td className="py-5 px-2">Ул. Ленина 312</td>
                <td className="py-5 px-2 text-right">0</td>
                <td className="py-5 px-2 text-right">315 000</td>
                <td className="py-5 px-2 text-right">30</td>
                <td className="py-5 px-2 text-right">20</td>
              </tr>
            </tbody>
          </table>
          <button className="text-primary02 py-2.5 font-semibold text-sm">
            Настройки таблицы
          </button>

          <div className="mt-8">
            <OverflowTable
              tableData={tableUserData}
              columns={columnsUser}
              selectedColumns={selectedColumns}
            />
          </div>
          <button
            onClick={openModal}
            className="text-primary02 text-sm font-semibold flex items-center gap-2 mt-1.5 py-2 px-8"
          >
            Настройки таблицы <Edit />
          </button>

          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <TableSettings
              columns={columnsUser}
              selectedColumns={selectedColumns}
              onColumnToggle={handleColumnToggle}
              onIsModalOpen={closeModal}
            />
          </Modal>
        </div>
        */}
        <div className="mt-4 py-3 lg:py-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl px-3 lg:px-8">
            {t("indicators.revReport")}
          </p>
          <div className="lg:flex justify-between px-3 lg:px-8">
            <DropdownInput
              inputType="primary"
              label="Все автомойки"
              options={poses}
              value={selectedValue}
              onChange={setSelectedValue}
              isSelectable={true}
              classname="mt-3"
            />
            <div className="flex md:flex-row flex-col space-y-3 md:space-y-0 mt-3 md:mt-3">
              {durations.map((duration) => (
                <button
                  key={duration.label}
                  onClick={() => handleDurationClick(duration.value)}
                  className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-2 mx-2"
                >
                  {duration.label}
                </button>
              ))}
              <DatePickerComponent
                onDateChange={(range) =>
                  handleDateChange({
                    startDate: range.startDate, // Assuming DatePicker returns an array
                    endDate: range.endDate,
                  })
                }
               />
            </div>
          </div>
          <div>
            {filterLoading ? (<TableSkeleton columnCount={columnsMonitoringPos.length} />)
              :
              <OverflowTable
                tableData={posMonitoring}
                columns={columnsMonitoringPos}
                isDisplayEdit={true}
                nameUrl={"/station/enrollments/devices"}
              />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Indicators;
