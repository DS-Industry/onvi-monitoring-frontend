import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap";
import { useStartDate, useEndDate, usePageNumber, useSetPageNumber } from "@/hooks/useAuthStore.ts";
// import SearchInput from "../Input/SearchInput";
// import DropdownInput from "../Input/DropdownInput";
import Button from "../Button/Button";
import useSWR from "swr";
import { getPlacement } from "@/services/api/device";
import { useTranslation } from "react-i18next";
import SearchDropdownInput from "../Input/SearchDropdownInput";
import Select from "antd/es/select";
import Input from "antd/es/input";


type Props = {
  children: React.ReactNode;
  count: number;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  hideDateTime?: boolean;
  hideCity?: boolean;
  hideSearch?: boolean;
  search?: string;
  setSearch?: (value: string) => void;
  handleClear?: () => void;
  address?: number | string;
  setAddress?: (value: number | string) => void;
  hidePage?: boolean;
  hideCancel?: boolean;
};

const { Search } = Input;

const Filter: React.FC<Props> = ({
  children,
  count,
  searchTerm,
  setSearchTerm,
  hideDateTime = false,
  hideCity = false,
  hideSearch = false,
  search = "",
  setSearch,
  handleClear,
  address = 0,
  setAddress,
  hidePage = false,
  hideCancel
}: Props) => {
  const { t } = useTranslation();
  const allCategoriesText = t("warehouse.all");
  const { filterOpen } = useFilterOpen();
  const { buttonOn } = useButtonCreate();
  const contentRef = useRef<HTMLDivElement>(null);
  const storeStartDate = useStartDate();
  const storeEndDate = useEndDate();
  // const [linesPerPage, setLinesPerPage] = useState(10);
  const [startDate, setStartDate] = useState(storeStartDate);
  const [endDate, setEndDate] = useState(storeEndDate);
  const { filterOn, setFilterOn } = useFilterOn();
  const pageNumber = usePageNumber();
  const setPageNumber = useSetPageNumber();

  const { data: cityData } = useSWR([`get-city`], () => getPlacement(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

  const cities: { name: string; value: number | string; }[] = cityData?.map((item) => ({ name: item.region, value: item.id })) || []; 

  const citiesAllObj = {
    name: allCategoriesText,
    value: "*"
  };

  cities.unshift(citiesAllObj);

  useEffect(() => {
    if (filterOpen && !buttonOn) {
      contentRef.current!.style.maxHeight = `${contentRef.current!.scrollHeight}px`;
      contentRef.current!.style.overflow = "visible";
    } else {
      contentRef.current!.style.maxHeight = "0px";
      contentRef.current!.style.overflow = "hidden";
    }
  }, [filterOpen, buttonOn]);

  const handleReset = () => {
    if (setSearchTerm) setSearchTerm("");
    if (setAddress) setAddress("*");
    if (setSearch) setSearch("");
    if (handleClear) handleClear();
    setFilterOn(!filterOn);
  };
  const handleApply = () => {
    if (setSearchTerm && searchTerm) setSearchTerm(searchTerm);
    if (setAddress && address) setAddress(address);
    if (setSearch && search) setSearch(search);
    setFilterOn(!filterOn);
  };

  const handleStartDateChange = (combinedDateTime: Date) => {
    setStartDate(combinedDateTime);
  };

  const handleEndDateChange = (combinedDateTime: Date) => {
    setEndDate(combinedDateTime);
  };

  const handleSearchChange = (value: string) => {
    if (setSearch) setSearch(value);
  };

  const handleAddressChange = (value: number | string) => {
    if (setAddress) setAddress(value);
  }

  return (
    <div
      ref={contentRef}
      className={`transition-all duration-500 ease-in-out max-h-0`}
    >
      <div className="flex flex-wrap gap-4">
        {!hideSearch &&
          // <SearchInput
          //   value={search}
          //   onChange={handleSearchChange}
          //   classname="w-full sm:w-80"
          //   searchType="outlined"
          //   title="Поиск"
          // />
          <div>
            <div className="text-sm text-text02">{t("analysis.search")}</div>
            <Search
              placeholder="Поиск"
              className="w-full sm:w-80"
              value={search}
              onSearch={handleSearchChange}
              onChange={(e) => {
                if (setSearch)
                  setSearch(e.target.value);
              }}
              size="large"
            />
          </div>
        }
        {!hideCity &&
            <SearchDropdownInput
              title={t("pos.city")}
              classname="w-full sm:w-80"
              placeholder="Город"
              options={cities}
              value={address}
              onChange={handleAddressChange}
            />
        }
        {children}
        {!hidePage && (<div>
          <div className="text-sm text-text02">{t("tables.lines")}</div>
          <Select
            className="w-24 h-10"
            options={[{ label: 15, value: 15 }, { label: 50, value: 50 }, { label: 100, value: 100 }, { label: 120, value: 120 }]}
            value={pageNumber}
            onChange={setPageNumber}
            dropdownRender={(menu) => (
              <div style={{ maxHeight: 100, overflowY: "auto" }}>
                {menu}
              </div>
            )}
          />
        </div>
        )}
      </div>
      {!hideDateTime ? (
        <div>
          <InputDateGap
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            defaultDateStart={startDate}
            defaultDateEnd={endDate}
          />
        </div>
      ) :
        <div className="h-5"></div>}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {!hideCancel && <Button title="Сбросить" handleClick={handleReset} type="outline" classname="w-[168px]"/>}
        <Button title="Применить" handleClick={handleApply} classname="w-[168px]"/>
        <p className="font-semibold">Найдено: {count}</p>
        {/* <Button
          title={"Дополнительно"}
          classname="ml-96"
          type="outline"
          iconDown={true}
        /> */}
      </div>
    </div>
  );
};

export default Filter;
