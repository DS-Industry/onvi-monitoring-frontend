import React, { useState } from "react";
import TotalVisitorsIcon from "../../assets/icons/total-visitors.svg?react";
import ProfitIcon from "../../assets/icons/profit.svg?react";
import TotalDownTimeIcon from "../../assets/icons/total-downtime.svg?react";
import TrendingUpIcon from "../../assets/icons/trending-up.svg?react";
import TrendingDownIcon from "../../assets/icons/trending-down.svg?react";
import Edit from "../../assets/icons/edit.svg?react";
import Notification from "../ui/Notification";
import LineChart from "../ui/LineChart";
import DatePickerComponent from "../ui/DatePickerComponent";
import OverflowTable from "../ui/OverflowTable";
import Modal from "../ui/Modal";
import TableSettings from "../ui/TableSettings";
import { columns, tableData } from "../../utils/OverFlowTableData";

const cards = [
  {
    title: "Всего посетителей",
    number: "12,00",
    unit: "",
    icon: TotalVisitorsIcon,
    isPositive: true,
    percentage: "12",
    day: "К предыдущему дню",
  },
  {
    title: "Новые посетители",
    number: "1,500",
    unit: "₽",
    icon: ProfitIcon,
    isPositive: true,
    percentage: "15",
    day: "К предыдущему дню",
  },
  {
    title: "Выручка",
    number: "12,500",
    unit: "мин",
    icon: TotalDownTimeIcon,
    isPositive: false,
    percentage: "12",
    day: "К предыдущему дню",
  },
];

const selectOptions: {
  value: string;
  label: string;
}[] = [
  { value: "last_7_days", label: "Последние 7 дней" },
  { value: "last_30_days", label: "Последние 30 дней" },
  { value: "last_90_days", label: "Последние 90 дней" },
  { value: "last_month", label: "Последний месяц" },
  { value: "last_year", label: "Последний год" },
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
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.map((col) => col.key)
  );

  const handleColumnToggle = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {notificationVisible && (
        <Notification
          title="Показатели"
          message="В  данном разделе будут отображаться основные показатели по автомойкам за день"
          onClose={() => setNotificationVisible(false)}
        />
      )}
      <div className="grid gap-4">
        <div className="lg:flex space-y-6 lg:space-y-0 lg:space-x-6">
          {cards.map((item) => (
            <div
              className="p-4 bg-white shadow-card rounded-[18px] "
              key={item.title}
            >
              <div className="flex space-x-4 mb-5">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-3xl font-bold text-[#202224]">
                    {item.number} {item.unit}
                  </p>
                </div>
                <item.icon />
              </div>
              <p className="text-text03 flex">
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
            </div>
          ))}
        </div>

        <div className="mt-4 p-8 grid gap-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl">
            График по выручке
          </p>
          <div className="lg:flex justify-between">
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
                <button
                  key={duration.label}
                  className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-1 mx-2"
                >
                  {duration.label}
                </button>
              ))}
             <DatePickerComponent />
            </div>
          </div>
          <div className="container">
            <LineChart />
          </div>
        
        </div>
        <div className="mt-4 py-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl mb-8 px-8">
            Отчет по выручке
          </p>
          <div className="lg:flex justify-between mb-8 px-8">
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
          {/* <table className="w-full text-sm border-b">
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
          </button> */}


          <div className="mt-8 px-8">
            <OverflowTable
              tableData={tableData}
              columns={columns}
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
              columns={columns}
              selectedColumns={selectedColumns}
              onColumnToggle={handleColumnToggle}
              onIsModalOpen={closeModal}
            />
          </Modal>
        
        </div>
      </div>
    </>
  );
};

export default Indicators;
