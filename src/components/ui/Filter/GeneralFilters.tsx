import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, Input, Collapse, DatePicker, Space, TimePicker } from "antd";
import Button from "@ui/Button/Button.tsx";
import SearchDropdownInput from "@ui/Input/SearchDropdownInput.tsx";

const { Search } = Input;

import useSWR from "swr";
import { getPlacement } from "@/services/api/device/index.ts";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { updateSearchParams } from "@/utils/searchParamsUtils";

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/utils/constants.ts";

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
  hideDateAndTime?: boolean;
  children?: React.ReactNode;
  onReset?: () => void;
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
  hideDateAndTime = false,
  children,
  onReset,
}) => {
  const { t } = useTranslation();
  const allCategoriesText = t("warehouse.all");
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const [startDate, setStartDate] = useState(
    dayjs(getParam("dateStart") || dayjs().format("YYYY-MM-DDTHH:mm"))
  );

  const [endDate, setEndDate] = useState(
    dayjs(getParam("dateEnd") || dayjs().format("YYYY-MM-DDTHH:mm"))
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

  useEffect(() => {
    if (!hideDateAndTime) {
      const currentStart = searchParams.get("dateStart");
      const currentEnd = searchParams.get("dateEnd");

      if (!currentStart || !currentEnd) {
        const defaultStart = dayjs()
          .subtract(7, "day")
          .format("YYYY-MM-DDTHH:mm");
        const defaultEnd = dayjs().format("YYYY-MM-DDTHH:mm");

        updateSearchParams(searchParams, setSearchParams, {
          dateStart: defaultStart,
          dateEnd: defaultEnd,
        });

        setStartDate(dayjs(defaultStart));
        setEndDate(dayjs(defaultEnd));
      }
    }
  }, [hideDateAndTime, searchParams, setSearchParams]);

  const resetFilters = () => {
    const today = dayjs().format("YYYY-MM-DDTHH:mm");

    updateSearchParams(searchParams, setSearchParams, {
      dateStart: today,
      dateEnd: today,
      city: "*",
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
      posId: "*",
      deviceId: "",
      warehouseId: "",
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
                        page: DEFAULT_PAGE,
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
                        page: DEFAULT_PAGE,
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
                        page: DEFAULT_PAGE,
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
                        page: DEFAULT_PAGE,
                      });
                    }}
                    loading={loadingPos}
                  />
                ) : null}

                {devicesSelect?.length ? (
                  <div className="flex flex-col text-sm text-text02">
                    {t("analysis.deviceId")}
                    <Select
                      className="w-full sm:w-80"
                      placeholder="Выберите устройство"
                      value={Number(getParam("deviceId", ""))}
                      onChange={(val) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          deviceId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={devicesSelect.map((item) => ({
                        label: item.name,
                        value: item.value,
                      }))}
                    />
                  </div>
                ) : null}

                {wareHousesSelect?.length ? (
                  <div className="flex flex-col text-sm text-text02">
                    {t("analysis.warehouseId")}
                    <Select
                      className="w-full sm:w-80"
                      placeholder="Введите название склада"
                      value={getParam("warehouseId", "*")}
                      onChange={(val) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          warehouseId: val,
                        });
                      }}
                      options={wareHousesSelect.map((item) => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
                      size="large"
                    />
                  </div>
                ) : null}
                {children}
              </div>
              {!hideDateAndTime && (
                <div className="mt-4">
                  <Space size="middle" direction="horizontal">
                    <div className="flex flex-row gap-1">
                      <DatePicker
                        value={startDate}
                        format="YYYY-MM-DD"
                        onChange={(date) => {
                          if (date) {
                            const newDateTime = startDate
                              .set("year", date.year())
                              .set("month", date.month())
                              .set("date", date.date());
                            setStartDate(newDateTime);
                            updateSearchParams(searchParams, setSearchParams, {
                              dateStart: newDateTime.format("YYYY-MM-DDTHH:mm"),
                              page: DEFAULT_PAGE,
                            });
                          }
                        }}
                        placeholder="Start Date"
                      />
                      <TimePicker
                        value={startDate}
                        format="HH:mm"
                        onChange={(time) => {
                          if (time) {
                            const newDateTime = startDate
                              .set("hour", time.hour())
                              .set("minute", time.minute());
                            setStartDate(newDateTime);
                            updateSearchParams(searchParams, setSearchParams, {
                              dateStart: newDateTime.format("YYYY-MM-DDTHH:mm"),
                              page: DEFAULT_PAGE,
                            });
                          }
                        }}
                        placeholder="Start Time"
                      />
                    </div>

                    <div className="flex flex-row gap-1">
                      <DatePicker
                        value={endDate}
                        format="YYYY-MM-DD"
                        onChange={(date) => {
                          if (date) {
                            const newDateTime = endDate
                              .set("year", date.year())
                              .set("month", date.month())
                              .set("date", date.date());
                            setEndDate(newDateTime);
                            updateSearchParams(searchParams, setSearchParams, {
                              dateEnd: newDateTime.format("YYYY-MM-DDTHH:mm"),
                              page: DEFAULT_PAGE,
                            });
                          }
                        }}
                        placeholder="End Date"
                      />
                      <TimePicker
                        value={endDate}
                        format="HH:mm"
                        onChange={(time) => {
                          if (time) {
                            const newDateTime = endDate
                              .set("hour", time.hour())
                              .set("minute", time.minute());
                            setEndDate(newDateTime);
                            updateSearchParams(searchParams, setSearchParams, {
                              dateEnd: newDateTime.format("YYYY-MM-DDTHH:mm"),
                              page: DEFAULT_PAGE,
                            });
                          }
                        }}
                        placeholder="End Time"
                      />
                    </div>
                  </Space>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {!hideReset && (
                  <Button
                    title="Сбросить"
                    type="outline"
                    handleClick={() => {
                      if (onReset) onReset();
                      else resetFilters();
                    }}
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
