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
import { getDeposit } from "@/services/api/monitoring";
import OverflowTable from "@ui/Table/OverflowTable.tsx";
import DropdownInput from "@ui/Input/DropdownInput";
import TableSkeleton from "../ui/Table/TableSkeleton";

interface PosMonitoring {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface Statistic {
  cars: number;
  sum: number;
  downtime: number;
}

const selectOptions: {
  value: string;
  name: string;
}[] = [
    { value: "last_7_days", name: "Последние 7 дней" },
    { value: "last_30_days", name: "Последние 30 дней" },
    { value: "last_90_days", name: "Последние 90 дней" },
    { value: "last_month", name: "Последний месяц" },
    { value: "last_year", name: "Последний год" },
  ];

const durations: { label: string }[] = [
  { label: "Today" },
  { label: "For a week" },
  { label: "For a month" },
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
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const [notificationVisible, setNotificationVisible] = useState(true);
  const [selectedValue, setSelectedValue] = useState('');

  const { data } = useSWR(['get-statistic-org'], () => getStatistic(
    12, { dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59` }
  ))

  const { data: filter, isLoading: filterLoading } = useSWR(['get-pos-deposits'], () => getDeposit({
    dateStart: `01.01.2024 00:00`,
    dateEnd: `${formattedDate} 23:59`
  }));

  const posMonitoring: PosMonitoring[] = filter?.map((item: PosMonitoring) => {
    return item;
  }).sort((a: { id: number; }, b: { id: number; }) => a.id - b.id) || [];

  const statisticData: Statistic = data;

  const cards = [
    {
      title: "Всего посетителей",
      number: statisticData ? statisticData.cars : 0,
      unit: "",
      icon: TotalVisitorsIcon,
      isPositive: true,
      percentage: "12",
      day: "К предыдущему дню",
    },
    {
      title: "Прибыль",
      number: statisticData ? statisticData.sum : 0,
      unit: "₽",
      icon: ProfitIcon,
      isPositive: true,
      percentage: "15",
      day: "К предыдущему дню",
    },
    {
      title: "Общее время простоя",
      number: 7,
      unit: "мин",
      icon: TotalDownTimeIcon,
      isPositive: true,
      percentage: "15",
      day: "К предыдущему дню",
    },
  ];

  return (
    <>
      {notificationVisible && (
        <Notification
          title="Показатели"
          message="В  данном разделе будут отображаться основные показатели по автомойкам за день"
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
                    {item.title}
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
            График по выручке
          </p>
          <div className="lg:flex justify-between px-3 lg:px-8">
            {/* <select
              id="countries"
              className="bg-[#F7F9FC] border border-text03/30 text-text01 text-sm rounded-md focus:ring-text03 focus:border-text03 block md:w-64 p-2.5 outline-none"
            >
              <option selected>Choose a country</option>
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select> */}
            <DropdownInput
              inputType="primary"
              label="Choose a country"
              options={selectOptions}
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
        <div className="mt-8">
          {filterLoading ? (<TableSkeleton columnCount={columnsMonitoringPos.length} />)
            :
            <OverflowTable
              tableData={posMonitoring}
              columns={columnsMonitoringPos}
            />}
        </div>
      </div>
    </>
  );
};

export default Indicators;
