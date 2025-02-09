import BarChart from "@ui/BarChart";
import useSWR from "swr";
import { getRating } from "@/services/api/organization";
import { useTranslation } from "react-i18next";
import DropdownInput from "@ui/Input/DropdownInput";
import { useState } from "react";
import DatePickerComponent from "@ui/DatePickerComponent";
import { getPoses } from "@/services/api/equipment";

type Rating = {
  posName: string;
  sum: number;
};

// const selectOptions: {
//   value: string;
//   name: string;
// }[] = [
//   { value: "last_7_days", name: "Последние 7 дней" },
//   { value: "last_30_days", name: "Последние 30 дней" },
//   { value: "last_90_days", name: "Последние 90 дней" },
//   { value: "last_month", name: "Последний месяц" },
//   { value: "last_year", name: "Последний год" },
// ];

const durations: { label: string; value: "today" | "week" | "month" }[] = [
  { label: "Today", value: "today" },
  { label: "For a week", value: "week" },
  { label: "For a month", value: "month" },
];

const RatingOfCarWases = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);
  const { t } = useTranslation();

  const [selectedValue, setSelectedValue] = useState("");
  const [dateRange, setDateRange] = useState({
    dateStart: new Date("2023-01-01T00:00:00"),
    dateEnd: new Date(`${formattedDate}T23:59:59`),
  });

  // SWR fetch with dynamic date range
  const { data } = useSWR(["get-rating-org", dateRange], () =>
    getRating(dateRange)
  );

  const { data: posData } = useSWR([`get-pos`], () => getPoses(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

  const ratingData: Rating[] = data?.map((item: Rating) => item) || [];

  // Handle date range change
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
      <div className="mt-4 grid gap-8 p-3 lg:p-8 bg-white shadow-card rounded-lg">
        <p className="text-background01 font-semibold text-2xl">
          {t("indicators.carWash")}
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
            {/* Pass the handler to DatePickerComponent */}
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

        <div className="w-64 md:container">
          <BarChart data={ratingData} />
        </div>
      </div>
    </>
  );
};

export default RatingOfCarWases;
