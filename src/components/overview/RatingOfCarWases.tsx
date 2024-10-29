import BarChart from "@ui/BarChart";
import useSWR from "swr";
import { getRating } from "@/services/api/organization";
import { useTranslation } from "react-i18next";

type Rating = {
  posName: string;
  sum: number;
};

const RatingOfCarWases = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);
  const { t } = useTranslation();
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
          {t("indicators.revenue")}
        </p>
        <div className="w-64 md:container">
          <BarChart data={ratingData} />
        </div>
      </div>
    </>
  );
};

export default RatingOfCarWases;
