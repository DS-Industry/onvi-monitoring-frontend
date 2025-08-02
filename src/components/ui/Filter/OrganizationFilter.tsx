import React from "react";
import { useSearchParams } from "react-router-dom";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getOrganization } from "@/services/api/organization/index.ts";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import { DEFAULT_PAGE } from "@/utils/constants.ts";

const OrganizationFilter: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const city = getParam("city", "*");
  const placementId = city === "*" ? "" : city;

  const { data: organizationData, isLoading } = useSWR(
    placementId ? [`get-organization`, placementId] : null,
    () => getOrganization({ placementId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const handleChange = (val: string) => {
    updateSearchParams(searchParams, setSearchParams, {
      orgId: val,
      page: DEFAULT_PAGE,
    });
  };

  if (!organizationData?.length && !isLoading) return null;

  const organizations = [
    { name: t("warehouse.all"), value: "*" },
    ...(organizationData?.map((item) => ({
      name: item.name,
      value: String(item.id),
    })) || []),
  ];

  return (
    <Select
      className="w-full sm:w-80"
      placeholder={t("filters.organization.placeholder")}
      value={getParam("orgId", "")}
      onChange={handleChange}
      loading={isLoading}
      options={organizations.map((item) => ({
        label: item.name,
        value: item.value,
      }))}
    />
  );
};

export default OrganizationFilter;