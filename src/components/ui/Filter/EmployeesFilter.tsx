import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Select, Collapse, Space, Typography } from "antd";
import AntInput from 'antd/es/input';
import Button from "@ui/Button/Button.tsx";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/utils/constants.ts";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device";

const Text = Typography.Text;

type Optional = {
  name: string;
  value: string | number;
};

type EmployeesFilterProps = {
  count: number;
  positions?: Optional[];
  organizations?: Optional[];
};

const EmployeesFilter: React.FC<EmployeesFilterProps> = ({
  count,
  positions,
  organizations,
}) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeFilterKey, setActiveFilterKey] = useState<string | string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [name, setName] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const allCategoriesText = t("warehouse.all");

  const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const cities: { name: string; value: number | string; }[] = cityData?.map((item) => ({ name: item.region, value: item.id })) || [];

  const citiesAllObj = {
    name: allCategoriesText,
    value: "*"
  };

  cities.unshift(citiesAllObj);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      updateSearchParams(searchParams, setSearchParams, {
        name: name || undefined,
        page: DEFAULT_PAGE,
      });
    }, 1000);

    setTimeoutId(newTimeoutId);
  }, [name]);

  const getParam = (key: string, fallback: string = ""): string =>
    searchParams.get(key) || fallback;

  const resetFilters = () => {
    setName("");
    updateSearchParams(searchParams, setSearchParams, {
      placementId: "*",
      hrPositionId: "*",
      organizationId: "*",
      name: undefined,
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
    });
  };

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={(keys: string | string[]) => setActiveFilterKey(keys)}
      items={[
        {
          key: "filter-1",
          label: (
            <span className="font-semibold text-base">
              {Array.isArray(activeFilterKey) && activeFilterKey.includes("filter-1")
                ? t("routes.filter")
                : t("routes.expand")}
            </span>
          ),
          style: { background: "#fafafa", borderRadius: 8 },
          children: (
            <div
              ref={contentRef}
              className="overflow-hidden transition-all duration-500 ease-in-out"
            >

              <div className="mt-4">

                <Space size="middle" direction="horizontal">

                  <Space direction="vertical" size={0}>

                    <Text>{t("pos.city")}</Text>

                    <Select
                      className="w-full sm:w-80"
                      value={getParam("placementId", "*")}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          placementId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={cities?.map((item) => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                    />

                  </Space>

                  <Space direction="vertical" size={0}>

                    <Text>{t("roles.job")}</Text>

                    <Select

                      className="w-full sm:w-80"
                      value={getParam("hrPositionId", "*")}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          hrPositionId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={positions?.map((item) => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                    />

                  </Space>

                  <Space direction="vertical" size={0}>

                    <Text>{t("warehouse.organization")}</Text>

                    <Select
                      className="w-full sm:w-80"
                      value={getParam("organizationId", "*")}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          organizationId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={organizations?.map((item) => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                    />

                  </Space>

                  <Space direction="vertical" size={0}>

                    <Text>{t("hr.full")}</Text>

                    <AntInput
                      type="string"
                      className="w-full sm:w-80 h-10"
                      placeholder={t("hr.enter")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                  </Space>

                </Space>

              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">

                <Button
                  title={t("analysis.reset")}
                  type="outline"
                  handleClick={resetFilters}
                  classname="w-[168px]"
                />

                <p className="font-semibold">{t("analysis.found")}: {count}</p>

              </div>
              
            </div>
          ),
        },
      ]}
    />
  );
};

export default EmployeesFilter;
