import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, Input, Collapse, DatePicker, Space } from "antd";
import Button from "@ui/Button/Button.tsx";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";

const { Search } = Input;

import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { updateSearchParams } from "@/utils/updateSearchParams";

type Optional = {
  name: string;
  value: string | number;
};

type GeneralFiltersProps = {
  count: number;
  organizationsSelect?: Optional[];
  devicesSelect?: Optional[];
  wareHousesSelect?: Optional[];
  poses?: Optional[];
  hideCity?: boolean;
  hideSearch?: boolean;
  hideReset?: boolean;
  loadingPos?: boolean;
};

const GeneralFilters: React.FC<GeneralFiltersProps> = ({
  count,
  organizationsSelect,
  devicesSelect,
  wareHousesSelect,
  hideCity = false,
  hideSearch = false,
  hideReset = false,
  loadingPos,
  poses,
}) => {
  const { t } = useTranslation();
  const allCategoriesText = t("warehouse.all");
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const [startDate, setStartDate] = useState(
    dayjs(getParam("dateStart") || dayjs().format("YYYY-MM-DD"))
  );

  const [endDate, setEndDate] = useState(
    dayjs(getParam("dateEnd") || dayjs().format("YYYY-MM-DD"))
  );

  const [filterToggle, setFilterToggle] = useState(false);

  const { data: cityData } = useSWR("get-city", getPlacement);

  const cities: Optional[] = [
    { name: allCategoriesText, value: "*" },
    ...(cityData?.map((item) => ({
      name: item.region,
      value: String(item.id),
    })) || []),
  ];

  const resetFilters = () => {
    const today = dayjs().format("YYYY-MM-DD");

    updateSearchParams(searchParams, setSearchParams, {
      dateStart: today,
      dateEnd: today,
      city: "*",
      page: "1",
      size: "15",
    });

    setStartDate(dayjs());
    setEndDate(dayjs());
    setFilterToggle(!filterToggle);
  };

  return (
    <Collapse
      bordered={false}
      ghost
      style={{ marginBottom: 16 }}
      activeKey={activeFilterKey}
      onChange={(keys) => setActiveFilterKey(keys as string[])}
      items={[
        {
          key: "filter-1",
          label: (
            <span className="font-semibold text-base">
              {activeFilterKey.includes("1")
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
              <div className="flex flex-wrap gap-4">
                {!hideSearch && (
                  <Search
                    placeholder="Поиск"
                    className="w-full sm:w-80"
                    onSearch={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        search: val,
                        page: "1",
                      });
                    }}
                  />
                )}

                {!hideCity && (
                  <SearchDropdownInput
                    title={t("pos.city")}
                    classname="w-full sm:w-80"
                    options={cities}
                    value={getParam("city", "*")}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        city: val,
                        page: "1",
                      });
                    }}
                  />
                )}

                {organizationsSelect?.length ? (
                  <Select
                    className="w-full sm:w-80"
                    placeholder="Выберите организацию"
                    value={getParam("orgId", "")}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        orgId: val,
                        page: "1",
                      });
                    }}
                    options={organizationsSelect.map((item) => ({
                      label: item.name,
                      value: item.value,
                    }))}
                  />
                ) : null}

                {poses?.length ? (
                  <SearchDropdownInput
                    title={t("analysis.posId")}
                    classname="w-full sm:w-80"
                    placeholder="Выберите объект"
                    options={poses.map((item) => ({
                      ...item,
                      value: String(item.value),
                    }))}
                    value={getParam("posId", "*")}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        posId: val,
                        page: "1",
                      });
                    }}
                    loading={loadingPos}
                  />
                ) : null}

                {devicesSelect?.length ? (
                  <Select
                    className="w-full sm:w-80"
                    placeholder="Выберите устройство"
                    value={getParam("deviceId", "")}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        deviceId: val,
                        page: "1",
                      });
                    }}
                    options={devicesSelect.map((item) => ({
                      label: item.name,
                      value: item.value,
                    }))}
                  />
                ) : null}

                {wareHousesSelect?.length ? (
                  <Select
                    className="w-full sm:w-80"
                    placeholder="Введите название склада"
                    value={getParam("warehouseId", "")}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        warehouseId: val,
                        page: "1",
                      });
                    }}
                    options={wareHousesSelect.map((item) => ({
                      label: item.name,
                      value: item.value,
                    }))}
                  />
                ) : null}

                <div className="flex flex-col">
                  <label className="text-sm text-text02">
                    {t("tables.lines")}
                  </label>
                  <Select
                    className="w-24"
                    value={Number(getParam("size", "15"))}
                    onChange={(val) => {
                      updateSearchParams(searchParams, setSearchParams, {
                        size: val,
                        page: "1",
                      });
                    }}
                    options={[15, 50, 100, 120].map((n) => ({
                      label: n,
                      value: n,
                    }))}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Space size="middle">
                  <DatePicker
                    value={startDate}
                    format="YYYY-MM-DD"
                    onChange={(date) => {
                      setStartDate(date);
                      if (date) {
                        updateSearchParams(searchParams, setSearchParams, {
                          dateStart: date.format("YYYY-MM-DD"),
                          page: "1",
                        });
                      }
                    }}
                    placeholder="Start Date"
                  />
                  <DatePicker
                    value={endDate}
                    format="YYYY-MM-DD"
                    onChange={(date) => {
                      setEndDate(date);
                      if (date) {
                        updateSearchParams(searchParams, setSearchParams, {
                          dateEnd: date.format("YYYY-MM-DD"),
                          page: "1",
                        });
                      }
                    }}
                    placeholder="End Date"
                  />
                </Space>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {!hideReset && (
                  <Button
                    title="Сбросить"
                    type="outline"
                    handleClick={resetFilters}
                    classname="w-[168px]"
                  />
                )}
                <p className="font-semibold">Найдено: {count}</p>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default GeneralFilters;
