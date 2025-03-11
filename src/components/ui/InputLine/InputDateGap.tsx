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

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = event.target.value;
        setDateStart(newDate);  // Allow free typing
    
        // Only update when a complete date (YYYY-MM-DD) is entered
        if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
            const updatedDateTime = new Date(`${newDate}T${timeStart}`);
            if (!isNaN(updatedDateTime.getTime())) {
                onStartDateChange(updatedDateTime);
            }
        }
    };    
    
    const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setTimeStart(newTime);
    
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStart) && newTime) {
            const updatedDateTime = new Date(`${dateStart}T${newTime}`);
            if (!isNaN(updatedDateTime.getTime())) {
                onStartDateChange(updatedDateTime);
            }
        }
    };
    
    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = event.target.value;
        setDateEnd(newDate);
    
        if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
            const updatedDateTime = new Date(`${newDate}T${timeEnd}`);
            if (!isNaN(updatedDateTime.getTime())) {
                onEndDateChange(updatedDateTime);
            }
        }
    };
    
    const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = event.target.value;
        setTimeEnd(newTime);
    
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateEnd) && newTime) {
            const updatedDateTime = new Date(`${dateEnd}T${newTime}`);
            if (!isNaN(updatedDateTime.getTime())) {
                onEndDateChange(updatedDateTime);
            }
        }
    };

    useEffect(() => {
        const updatedStartDate = typeof defaultDateStart === "string" ? new Date(defaultDateStart) : defaultDateStart;
        const updatedEndDate = typeof defaultDateEnd === "string" ? new Date(defaultDateEnd) : defaultDateEnd;
    
        // Prevent updates when user is typing an incomplete date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStart) || !/^\d{4}-\d{2}-\d{2}$/.test(dateEnd)) return;
    
        if (!isNaN(updatedStartDate.getTime()) && formatDate(updatedStartDate) !== dateStart) {
            setDateStart(formatDate(updatedStartDate));
            setTimeStart(formatTime(updatedStartDate));
        }
    
        if (!isNaN(updatedEndDate.getTime()) && formatDate(updatedEndDate) !== dateEnd) {
            setDateEnd(formatDate(updatedEndDate));
            setTimeEnd(formatTime(updatedEndDate));
        }
    }, [defaultDateStart, defaultDateEnd]);         

    return (
        <div className="my-5">
            <p className="text-sm text-text02 mb-1.5">Период</p>
            <div className="w-full flex flex-wrap gap-x-2 gap-y-4 text-text02">
                <div className="flex flex-wrap gap-2 items-center w-fit">
                    <span>с</span>
                    <Input type="date" value={dateStart} changeValue={handleStartDateChange} />
                    <Input type="time" value={timeStart} changeValue={handleStartTimeChange} />
                </div>
                <div className="flex flex-wrap gap-2 items-center w-fit">
                    <span>по</span>
                    <Input type="date" value={dateEnd} changeValue={handleEndDateChange} />
                    <Input type="time" value={timeEnd} changeValue={handleEndTimeChange} />
                </div>
            </div>

        </div>

    );
};

export default InputDateGap;
