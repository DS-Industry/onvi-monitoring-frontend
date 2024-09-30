import BarChart from "@ui/BarChart";
import useSWR from "swr";
import {getRating} from "@/services/api/organization";

const RatingOfCarWases = () => {
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10);

  const {data, error, } = useSWR(['get-rating-org-12'], () => getRating(
      12, {dateStart: `${formattedDate} 00:00`, dateEnd: `${formattedDate} 23:59`}
  ))

  const ratingData: Rating[] = data?.map((item: Rating) => {
    return item;
  }) || [];

  return (
    <>
      <div className="mt-4 grid gap-8 p-3 lg:p-8 bg-white shadow-card rounded-lg">
        <p className="text-background01 font-semibold text-2xl">
          График по выручке
        </p>
        <div className="w-64 md:container">
          <BarChart data={ratingData}/>
        </div>
      </div>
    </>
  );
};

export default RatingOfCarWases;
