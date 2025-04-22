import React, { useState, useEffect } from "react";
import { DatePicker, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const startDate = typeof defaultDateStart === "string" ? new Date(defaultDateStart) : defaultDateStart;
    const endDate = typeof defaultDateEnd === "string" ? new Date(defaultDateEnd) : defaultDateEnd;

    const [dateStart, setDateStart] = useState<Dayjs | null>(dayjs(startDate));
    const [timeStart, setTimeStart] = useState<Dayjs | null>(dayjs(startDate));
    const [dateEnd, setDateEnd] = useState<Dayjs | null>(dayjs(endDate));
    const [timeEnd, setTimeEnd] = useState<Dayjs | null>(dayjs(endDate));

    const handleStartDateChange = (value: Dayjs | null) => {
        setDateStart(value);
        if (value && timeStart) {
            const updatedDateTime = value.hour(timeStart.hour()).minute(timeStart.minute()).second(0).toDate();
            onStartDateChange(updatedDateTime);
        }
    };

    const handleStartTimeChange = (value: Dayjs | null) => {
        setTimeStart(value);
        if (dateStart && value) {
            const updatedDateTime = dateStart.hour(value.hour()).minute(value.minute()).second(0).toDate();
            onStartDateChange(updatedDateTime);
        }
    };

    const handleEndDateChange = (value: Dayjs | null) => {
        setDateEnd(value);
        if (value && timeEnd) {
            const updatedDateTime = value.hour(timeEnd.hour()).minute(timeEnd.minute()).second(0).toDate();
            onEndDateChange(updatedDateTime);
        }
    };

    const handleEndTimeChange = (value: Dayjs | null) => {
        setTimeEnd(value);
        if (dateEnd && value) {
            const updatedDateTime = dateEnd.hour(value.hour()).minute(value.minute()).second(0).toDate();
            onEndDateChange(updatedDateTime);
        }
    };

    useEffect(() => {
        const updatedStartDate = dayjs(defaultDateStart);
        const updatedEndDate = dayjs(defaultDateEnd);

        if (!updatedStartDate.isValid() || !updatedEndDate.isValid()) return;

        setDateStart(updatedStartDate);
        setTimeStart(updatedStartDate);
        setDateEnd(updatedEndDate);
        setTimeEnd(updatedEndDate);
    }, [defaultDateStart, defaultDateEnd]);

    return (
        <div className="my-5">
            <p className="text-sm text-text02 mb-1.5">{t("marketing.period")}</p>
            <div className="w-full flex flex-wrap gap-x-2 gap-y-4 text-text02">
                <div className="flex flex-wrap gap-2 items-center w-fit">
                    <span>с</span>
                    <DatePicker value={dateStart} onChange={handleStartDateChange} />
                    <TimePicker value={timeStart} onChange={handleStartTimeChange} format="HH:mm" />
                </div>
                <div className="flex flex-wrap gap-2 items-center w-fit">
                    <span>{t("analysis.endDate")}</span>
                    <DatePicker value={dateEnd} onChange={handleEndDateChange} />
                    <TimePicker value={timeEnd} onChange={handleEndTimeChange} format="HH:mm" />
                </div>
            </div>
        </div>
    );
};

export default InputDateGap;
