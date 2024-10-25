import React, { useState, useEffect } from "react";

type InputDateGapProps = {
    defaultDateStart: Date | string;
    defaultDateEnd: Date | string;
    onStartDateChange: (value: Date) => void;
    onEndDateChange: (value: Date) => void;
};

const InputDateGap: React.FC<InputDateGapProps> = ({
    defaultDateStart,
    defaultDateEnd,
    onStartDateChange,
    onEndDateChange
}) => {
    const startDate = typeof defaultDateStart === "string" ? new Date(defaultDateStart) : defaultDateStart;
    const endDate = typeof defaultDateEnd === "string" ? new Date(defaultDateEnd) : defaultDateEnd;

    const [dateStart, setDateStart] = useState(startDate.toISOString().split('T')[0]);
    const [timeStart, setTimeStart] = useState(startDate.toTimeString().slice(0, 5));
    const [dateEnd, setDateEnd] = useState(endDate.toISOString().split('T')[0]);
    const [timeEnd, setTimeEnd] = useState(endDate.toTimeString().slice(0, 5));

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
        
        setDateStart(updatedStartDate.toISOString().split('T')[0]);
        setTimeStart(updatedStartDate.toTimeString().slice(0, 5));
        setDateEnd(updatedEndDate.toISOString().split('T')[0]);
        setTimeEnd(updatedEndDate.toTimeString().slice(0, 5));
    }, [defaultDateStart, defaultDateEnd]);

    return (
        <div className="my-5">
            <p className="text-sm text-text02 mb-1.5">Период</p>
            <div className="w-1/2 flex gap-2.5 text-text02">
                {/* Start Date and Time */}
                <div className="flex gap-2.5 items-center">
                    <span>с</span>
                    <input
                        type="date"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateStart}
                        onChange={handleStartDateChange}
                    />
                    <input
                        type="time"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeStart}
                        onChange={handleStartTimeChange}
                    />
                </div>
                {/* End Date and Time */}
                <div className="flex gap-2.5 items-center">
                    <span>по</span>
                    <input
                        type="date"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateEnd}
                        onChange={handleEndDateChange}
                    />
                    <input
                        type="time"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeEnd}
                        onChange={handleEndTimeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputDateGap;
