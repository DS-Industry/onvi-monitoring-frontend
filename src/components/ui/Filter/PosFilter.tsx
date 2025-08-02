import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getPoses } from "@/services/api/equipment/index.ts";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { DEFAULT_PAGE } from "@/utils/constants.ts";

const PosFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const city = getParam("city", "*");
  const placementId = city === "*" ? "" : city;

  const { data: posData, isLoading } = useSWR(
    placementId ? [`get-pos`, placementId] : null,
    () => getPoses({ placementId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!posData?.length && !isLoading) return null;

  const poses = [
    { name: t("warehouse.all"), value: "*" },
    ...(posData?.map((item) => ({
      name: item.name,
      value: String(item.id),
    })) || []),
  ];

  return (
    <SearchDropdownInput
      title={t("analysis.posId")}
      classname="w-full sm:w-80"
      placeholder={t("filters.pos.placeholder")}
      options={poses}
      value={getParam("posId", "*")}
      onChange={handleChange}
      loading={isLoading}
    />
  );
};

export default PosFilter;