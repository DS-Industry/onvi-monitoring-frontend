import React, { useState, useEffect } from "react";
import Input from "../Input/Input";

type InputDateGapProps = {
    defaultDateStart: Date | string;
    defaultDateEnd: Date | string;
    onStartDateChange: (value: Date) => void;
    onEndDateChange: (value: Date) => void;
};

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
};

const InputDateGap: React.FC<InputDateGapProps> = ({
    defaultDateStart,
    defaultDateEnd,
    onStartDateChange,
    onEndDateChange
}) => {
    const startDate = typeof defaultDateStart === "string" ? new Date(defaultDateStart) : defaultDateStart;
    const endDate = typeof defaultDateEnd === "string" ? new Date(defaultDateEnd) : defaultDateEnd;

    const [dateStart, setDateStart] = useState(formatDate(startDate));
    const [timeStart, setTimeStart] = useState(formatTime(startDate));
    const [dateEnd, setDateEnd] = useState(formatDate(endDate));
    const [timeEnd, setTimeEnd] = useState(formatTime(endDate));

    // Handle date and time changes for start
    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDateStart(event.target.value);
        const updatedDateTime = new Date(`${event.target.value}T${timeStart}`);
        onStartDateChange(updatedDateTime);
    };

    const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimeStart(event.target.value);
        const updatedDateTime = new Date(`${dateStart}T${event.target.value}`);
        onStartDateChange(updatedDateTime);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDateEnd(event.target.value);
        const updatedDateTime = new Date(`${event.target.value}T${timeEnd}`);
        onEndDateChange(updatedDateTime);
    };

    const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimeEnd(event.target.value);
        const updatedDateTime = new Date(`${dateEnd}T${event.target.value}`);
        onEndDateChange(updatedDateTime);
    };

    useEffect(() => {
        const updatedStartDate = typeof defaultDateStart === "string" ? new Date(defaultDateStart) : defaultDateStart;
        const updatedEndDate = typeof defaultDateEnd === "string" ? new Date(defaultDateEnd) : defaultDateEnd;

        setDateStart(formatDate(updatedStartDate));
        setTimeStart(formatTime(updatedStartDate));
        setDateEnd(formatDate(updatedEndDate));
        setTimeEnd(formatTime(updatedEndDate));
    }, [defaultDateStart, defaultDateEnd]);

    return (
        <div className="my-5">
            <p className="text-sm text-text02 mb-1.5">Период</p>
            <div className="w-1/2 flex gap-2.5 text-text02">
                {/* Start Date and Time */}
                <div className="flex gap-2.5 items-center">
                    <span>с</span>
                    <Input
                        type="date"
                        // className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateStart}
                        changeValue={handleStartDateChange}
                    />
                    <Input
                        type="time"
                        // className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeStart}
                        changeValue={handleStartTimeChange}
                    />
                </div>
                {/* End Date and Time */}
                <div className="flex gap-2.5 items-center">
                    <span>по</span>
                    <Input
                        type="date"
                        // className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateEnd}
                        changeValue={handleEndDateChange}
                    />
                    <Input
                        type="time"
                        // className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeEnd}
                        changeValue={handleEndTimeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputDateGap;
