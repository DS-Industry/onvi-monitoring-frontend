import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { DEFAULT_PAGE } from "@/utils/constants.ts";

type Optional = {
  name: string;
  value: string | number;
};

type CityFilterProps = {
  className?: string;
};

const CityFilter: React.FC<CityFilterProps> = ({
  className = "w-full sm:w-80"
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: cityData } = useSWR("get-city", getPlacement);

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const cities: Optional[] = [
    { name: t("warehouse.all"), value: "*" },
    ...(cityData?.map((item) => ({
      name: item.region,
      value: String(item.id),
    })) || []),
  ];

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      city: val,
      page: DEFAULT_PAGE,
    });
  };

  return (
    <SearchDropdownInput
      title={t("pos.city")}
      classname={className}
      options={cities}
      value={getParam("city", "*")}
      onChange={handleChange}
    />
  );
};

export default CityFilter;