import React, { useState } from "react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

type DatePickerProps = {
  onDateChange?: (dateRange: { startDate: Date | null; endDate: Date | null }) => void;
};

const DatePickerComponent: React.FC<DatePickerProps> = ({ onDateChange }) => {
  const [value, setValue] = useState<DateValueType>({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue: DateValueType) => {
    console.log("newValue:", newValue);

    // Update state
    setValue(newValue);

    // Notify parent component with parsed Date objects
    if (newValue?.startDate && newValue?.endDate) {
      onDateChange && onDateChange({
        startDate: new Date(newValue.startDate),
        endDate: new Date(newValue.endDate),
      });
    } else {
      onDateChange && onDateChange({ startDate: null, endDate: null });
    }
  };

  return (
    <Datepicker
      useRange={true} // Enable range selection
      showFooter={true}
      popoverDirection="down"
      displayFormat={"DD/MM/YYYY"}
      value={value}
      onChange={handleValueChange}
      placeholder={"Период"}
      separator={"-"}
      inputClassName="bg-background05 focus:bg-primary02 px-3 py-3 rounded-full font-semibold text-text02"
    />
  );
};

export default DatePickerComponent;
