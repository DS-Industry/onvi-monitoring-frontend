import React, { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Select, Collapse, DatePicker, Space, TimePicker, Typography } from "antd";
import Button from "@ui/Button/Button.tsx";
import dayjs, { Dayjs } from "dayjs";
import { updateSearchParams } from "@/utils/updateSearchParams";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/utils/constants.ts";

const Text = Typography.Text;

type Optional = {
  name: string;
  value: string | number;
};

type SalaryCalculationFilterProps = {
  count: number;
  workers?: Optional[];
};

const SalaryCalculationFilter: React.FC<SalaryCalculationFilterProps> = ({
  count,
  workers,
}) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeFilterKey, setActiveFilterKey] = useState<string | string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key: string, fallback: string = ""): string =>
    searchParams.get(key) || fallback;

  const [startDate, setStartDate] = useState<Dayjs | null>(
    getParam("startPaymentDate") !== "*" && getParam("startPaymentDate")
      ? dayjs(getParam("startPaymentDate"))
      : null
  );

  const [endDate, setEndDate] = useState<Dayjs | null>(
    getParam("endPaymentDate") !== "*" && getParam("endPaymentDate")
      ? dayjs(getParam("endPaymentDate"))
      : null
  );

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      startPaymentDate: "*",
      endPaymentDate: "*",
      hrWorkerId: "*",
      page: DEFAULT_PAGE,
      size: DEFAULT_PAGE_SIZE,
    });

    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateChange = (date: Dayjs | null) => {
    if (date) {
      const newDateTime = (startDate || dayjs())
        .set("year", date.year())
        .set("month", date.month())
        .set("date", date.date());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
        page: DEFAULT_PAGE,
      });
    } else {
      setStartDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: "*",
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleStartTimeChange = (time: Dayjs | null) => {
    if (time) {
      const newDateTime = (startDate || dayjs())
        .set("hour", time.hour())
        .set("minute", time.minute());
      setStartDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        startPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
        page: DEFAULT_PAGE,
      });
    } else {
      if (startDate) {
        const newDateTime = startDate.startOf('day');
        setStartDate(newDateTime);
        updateSearchParams(searchParams, setSearchParams, {
          startPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
          page: DEFAULT_PAGE,
        });
      }
    }
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    if (date) {
      const newDateTime = (endDate || dayjs())
        .set("year", date.year())
        .set("month", date.month())
        .set("date", date.date());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
        page: DEFAULT_PAGE,
      });
    } else {
      setEndDate(null);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: "*",
        page: DEFAULT_PAGE,
      });
    }
  };

  const handleEndTimeChange = (time: Dayjs | null) => {
    if (time) {
      const newDateTime = (endDate || dayjs())
        .set("hour", time.hour())
        .set("minute", time.minute());
      setEndDate(newDateTime);
      updateSearchParams(searchParams, setSearchParams, {
        endPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
        page: DEFAULT_PAGE,
      });
    } else {
      if (endDate) {
        const newDateTime = endDate.startOf('day');
        setEndDate(newDateTime);
        updateSearchParams(searchParams, setSearchParams, {
          endPaymentDate: newDateTime.format("YYYY-MM-DDTHH:mm"),
          page: DEFAULT_PAGE,
        });
      }
    }
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

                    <Text>{t("hr.startPaymentDate")}</Text>

                    <div className="flex flex-row gap-1">

                      <DatePicker
                        value={startDate}
                        format="YYYY-MM-DD"
                        onChange={handleStartDateChange}
                        placeholder={t("finance.selU")}
                      />

                      <TimePicker
                        value={startDate}
                        format="HH:mm"
                        onChange={handleStartTimeChange}
                        placeholder={t("finance.selTime")}
                        disabled={!startDate}
                      />

                    </div>

                  </Space>

                  <Space direction="vertical" size={0}>

                    <Text>{t("hr.endPaymentDate")}</Text>

                    <div className="flex flex-row gap-1">

                      <DatePicker
                        value={endDate}
                        format="YYYY-MM-DD"
                        onChange={handleEndDateChange}
                        placeholder={t("finance.selU")}
                      />

                      <TimePicker
                        value={endDate}
                        format="HH:mm"
                        onChange={handleEndTimeChange}
                        placeholder={t("finance.selTime")}
                        disabled={!endDate}
                      />

                    </div>

                  </Space>

                  <Space direction="vertical" size={0}>

                    <Text>{t("routes.employees")}</Text>

                    <Select
                      className="w-full sm:w-80"
                      value={getParam("hrWorkerId", "*")}
                      onChange={(val: string) => {
                        updateSearchParams(searchParams, setSearchParams, {
                          hrWorkerId: val,
                          page: DEFAULT_PAGE,
                        });
                      }}
                      options={workers?.map((item) => ({
                        label: item.name,
                        value: String(item.value),
                      }))}
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

export default SalaryCalculationFilter;