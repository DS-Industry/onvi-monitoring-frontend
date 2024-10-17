import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

const DatePickerComponent: React.FC = () => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };

  return (
    <Datepicker
      useRange={false}
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
