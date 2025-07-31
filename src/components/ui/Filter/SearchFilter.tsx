import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, Collapse } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { updateSearchParams } from "@/utils/searchParamsUtils";
import Button from "@ui/Button/Button.tsx";

type Optional = {
  name: string;
  value: string | number;
};

type SearchFilterProps = {
  poses?: Optional[];
  loading?: boolean;
  count?: number;
};

const SearchFilter: React.FC<SearchFilterProps> = ({
  poses,
  loading = false,
  count = 0,
}) => {
  const { t } = useTranslation();
  const [activeFilterKey, setActiveFilterKey] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterToggle, setFilterToggle] = useState(false);

  const getParam = (key: string, fallback = "") =>
    searchParams.get(key) || fallback;

  const formattedOptions = (poses || []).map((pos) => ({
    label: pos.name,
    value: String(pos.value),
  }));

  const handlePosChange = (value: string | number) => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: value,
    });
  };

  // Get current posId and ensure it matches the option values format
  const currentPosId = getParam("posId");
  const displayValue = currentPosId && currentPosId !== "*" ? currentPosId : undefined;

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: "*",
    });

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
          key: "search-filter-1",
          label: (
            <span className="font-semibold text-base">
              {activeFilterKey.includes("search-filter-1")
                ? t("routes.filter")
                : t("routes.expand")}
            </span>
          ),
          style: { background: "#fafafa", borderRadius: 8 },
          children: (
            <div className="overflow-hidden transition-all duration-500 ease-in-out">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col text-sm text-text02">
                  <label className="mb-1">{t("analysis.posId")}</label>
                  <Select
                    showSearch
                    className="w-full sm:w-96"
                    placeholder="Выберите объект"
                    value={displayValue}
                    onChange={handlePosChange}
                    options={formattedOptions}
                    loading={loading}
                    allowClear
                    optionFilterProp="label"
                    filterOption={(input, option) => {
                      if (!option || !option.label) return false;
                      return option.label
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase());
                    }}
                    suffixIcon={<SearchOutlined className="text-text02" />}
                    notFoundContent={
                      loading ? "Поиск" : "Филиал с таким назаванием не найден"
                    }
                    size="large"
                    style={{
                      borderRadius: "6px",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Button
                  title="Сбросить"
                  type="outline"
                  handleClick={resetFilters}
                  classname="w-[168px]"
                />
                <p className="font-semibold">Найдено: {count}</p>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
};

export default SearchFilter;
