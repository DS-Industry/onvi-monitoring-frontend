import React, { useEffect, useRef, useState } from "react";
import { useFilterOpen } from "@/components/context/useContext.tsx";
import InputDateGap from "../InputLine/InputDateGap";
import { useStartDate, useEndDate } from "@/hooks/useAuthStore.ts";
import SearchInput from "../Input/SearchInput";
import DropdownInput from "../Input/DropdownInput";
import Button from "../Button/Button";

type Props = {
  children: React.ReactNode;
  count: number;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
};
const Filter: React.FC<Props> = ({
  children,
  count,
  searchTerm,
  setSearchTerm
}: Props) => {

  const { filterOpen } = useFilterOpen();
  const contentRef = useRef<HTMLDivElement>(null);
  const storeStartDate = useStartDate();
  const storeEndDate = useEndDate();
  const [city, setCity] = useState("");
  const [linesPerPage, setLinesPerPage] = useState(10);
  const [startDate, setStartDate] = useState(storeStartDate);
  const [endDate, setEndDate] = useState(storeEndDate);

  useEffect(() => {
    if (filterOpen) {
      contentRef.current!.style.maxHeight = "none"; // Allow natural height
    } else {
      contentRef.current!.style.maxHeight = "0";
    }
  }, [filterOpen]);

  const handleReset = () => {
    if (setSearchTerm)
      setSearchTerm('');
  }
  const handleApply = () => {
    if (setSearchTerm && searchTerm)
      setSearchTerm(searchTerm);
  }

  const handleStartDateChange = (combinedDateTime: Date) => {
    setStartDate(combinedDateTime);
  };

  const handleEndDateChange = (combinedDateTime: Date) => {
    setEndDate(combinedDateTime);
  };

  return (
    <div
      ref={contentRef}
      className={`overflow-hidden transition-all duration-500 ease-in-out max-h-0`}
    >
      <div className="flex">
        <SearchInput
          value={""}
          onChange={() => { }}
          classname="w-80"
          searchType="outlined"
          title="Поиск"
        />
        <DropdownInput
          title={"Город"}
          value={city}
          classname="ml-2"
          options={[]}
          onChange={(value) => setCity(value)}
        />
        {children}
        <DropdownInput
          title={"Строк на стр."}
          value={linesPerPage}
          classname="ml-2 w-24"
          options={[
            { name: 10, value: 10 },
            { name: 20, value: 20 },
            { name: 50, value: 50 }
          ]}
          onChange={(value) => setLinesPerPage(value)}
        />
      </div>
      <InputDateGap
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        defaultDateStart={startDate}
        defaultDateEnd={endDate}
      />

      <div className="flex items-center gap-6">
        <Button title="Сбросить"  handleClick={handleReset} type="outline" />
        <Button title="Применить"  handleClick={handleApply} />
        <p className="font-semibold">Найдено: {count}</p>
        <Button title={"Дополнительно"} classname="ml-96" type="outline" iconDown={true} />
      </div>
    </div>
  );
};

export default Filter;
