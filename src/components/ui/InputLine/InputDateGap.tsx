import React, { useState, useEffect } from "react";

type InputDateGapProps = {
    defaultDateStart: string;
    defaultDateEnd: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
};

const InputDateGap: React.FC<InputDateGapProps> = ({
    defaultDateStart,
    defaultDateEnd,
    onStartDateChange,
    onEndDateChange
}) => {
    const [dateStart, setDateStart] = useState(defaultDateStart.split(' ')[0]);
    const [timeStart, setTimeStart] = useState(defaultDateStart.split(' ')[1]);
    const [dateEnd, setDateEnd] = useState(defaultDateEnd.split(' ')[0]);
    const [timeEnd, setTimeEnd] = useState(defaultDateEnd.split(' ')[1]);

    // Handle date change for start
    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDateStart(event.target.value);
        const combinedDateTime = `${event.target.value} ${timeStart}`;
        onStartDateChange(combinedDateTime); // Pass combined value back to parent
    };

    // Handle time change for start
    const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimeStart(event.target.value);
        const combinedDateTime = `${dateStart} ${event.target.value}`;
        onStartDateChange(combinedDateTime); // Pass combined value back to parent
    };

    // Handle date change for end
    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDateEnd(event.target.value);
        const combinedDateTime = `${event.target.value} ${timeEnd}`;
        onEndDateChange(combinedDateTime); // Pass combined value back to parent
    };

    // Handle time change for end
    const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTimeEnd(event.target.value);
        const combinedDateTime = `${dateEnd} ${event.target.value}`;
        onEndDateChange(combinedDateTime); // Pass combined value back to parent
    };

    useEffect(() => {
        setDateStart(defaultDateStart.split(' ')[0]);
        setTimeStart(defaultDateStart.split(' ')[1])
        setDateEnd(defaultDateEnd.split(' ')[0])
        setTimeEnd(defaultDateEnd.split(' ')[1]);
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
