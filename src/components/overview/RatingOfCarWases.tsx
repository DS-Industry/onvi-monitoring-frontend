import BarChart from "@ui/BarChart";
import useSWR from "swr";
import { getRating } from "@/services/api/organization";
import { useTranslation } from "react-i18next";
import DropdownInput from "@ui/Input/DropdownInput";
import { useState } from "react";
import DatePickerComponent from "@ui/DatePickerComponent";

type Rating = {
  posName: string;
  sum: number;
};

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

const RatingOfCarWases = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState('');
  const { data } = useSWR(['get-rating-org'], () => getRating(
    { dateStart: new Date(`2023-01-01 00:00`), dateEnd: new Date(`${formattedDate} 23:59`) }
  ))

  const ratingData: Rating[] = data?.map((item: Rating) => {
    return item;
  }) || [];

  return (
    <>
      <div className="mt-4 grid gap-8 p-3 lg:p-8 bg-white shadow-card rounded-lg">
        <p className="text-background01 font-semibold text-2xl">
          {t("indicators.carWash")}
        </p>
        <div className="lg:flex justify-between px-3 lg:px-8">
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
         
        <div className="w-64 md:container">
          <BarChart data={ratingData} />
        </div>
      </div>
    </>
  );
};

export default RatingOfCarWases;
