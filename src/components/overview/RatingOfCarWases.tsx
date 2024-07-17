import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  BarElement,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import Notification from "../ui/Notification";
import Calendar from "../ui/Calendar"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
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


const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const data = {
  labels: ["Rent", "Groceries", "Utilities", "Entertainment"],
  datasets: [
    {
      label: "Expenses",
      data: [600, 300, 500, 180],
      backgroundColor: ["#5E5FCD", "#CD5E5E", "#A95ECD", "#6ECD5E"],
      borderRadius: 4,
      barThickness: 100
    },
  ],
};
const RatingOfCarWases = () => {
  const [notificationVisible, setNotificationVisible] = useState(true);

  return (
    <>
      {notificationVisible && (
        <Notification
          title="Ваши новости"
          message="В данном разделе будут отображаться главные новости и события вашей автомойки"
          onClose={() => setNotificationVisible(false)}
        />
      )}
       <div className="mt-4 grid gap-8 p-8 bg-white shadow-card rounded-lg">
          <p className="text-background01 font-semibold text-2xl">
            График по выручке
          </p>
          <div className="flex justify-between">
            <select
              id="countries"
              className="bg-[#F7F9FC] border border-text03/30 text-text01 text-sm rounded-md focus:ring-text03 focus:border-text03 block w-64 p-2.5 outline-none"
            >
              <option selected>Choose a country</option>
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              {durations.map((duration) => (
                <button
                  key={duration.label}
                  className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-1"
                >
                  {duration.label}
                </button>
              ))}
              <Calendar/>
              {/* <select
                id="countries"
                className="whitespace-nowrap text-text02 font-semibold focus:text-text04 bg-background05 focus:bg-primary02 text-sm rounded-full px-3 py-1 mx-2 outline-none"
              >
                <option selected>Choose a country</option>
                {selectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select> */}
            </div>
          </div>
          <Bar options={options} data={data} />
        </div>
    </>
  );
};

export default RatingOfCarWases;
