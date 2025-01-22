import React, { useEffect, useRef, useState } from "react";
import { useButtonCreate, useFilterOn, useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap";
import { useStartDate, useEndDate, usePageNumber, useSetPageNumber } from "@/hooks/useAuthStore.ts";
import SearchInput from "../Input/SearchInput";
import DropdownInput from "../Input/DropdownInput";
import Button from "../Button/Button";

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
  address?: string;
  setAddress?: (value: string) => void;
};
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
  address = "",
  setAddress
}: Props) => {
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
    if (setAddress) setAddress("");
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

  const handleAddressChange = (value: string) => {
    if (setAddress) setAddress(value);
  }

  return (
    <div
      ref={contentRef}
      className={`transition-all duration-500 ease-in-out max-h-0`}
    >
      <div className="flex">
        {!hideSearch && <SearchInput
          value={search}
          onChange={handleSearchChange}
          classname="w-80"
          searchType="outlined"
          title="Поиск"
        /> }
        {!hideCity && <SearchInput
          title={"Город"}
          value={address}
          searchType="outlined"
          classname="ml-2"
          onChange={handleAddressChange}
        /> }
        {children}
        <DropdownInput
          title={"Строк на стр."}
          value={pageNumber}
          classname="ml-2 w-24"
          options={[
            { name: 5, value: 5 },
            { name: 10, value: 10 },
            { name: 20, value: 20 },
            { name: 50, value: 50 },
          ]}
          onChange={(value) => setPageNumber(value)}
        />
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
      <div className="flex items-center gap-6">
        <Button title="Сбросить" handleClick={handleReset} type="outline" />
        <Button title="Применить" handleClick={handleApply} />
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
