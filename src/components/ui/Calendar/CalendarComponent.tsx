import React, { useState, useEffect } from "react";

type Props = {
    month: string;
    year: number;
}

const CalendarComponent: React.FC<Props> = ({
    month,
    year
}: Props) => {
    const [days, setDays] = useState([]);

    const generateCalendar = () => {
        const firstDay = new Date(year, getMonthIndex(month), 1).getDay();
        const daysInMonth = new Date(year, getMonthIndex(month) + 1, 0).getDate();

        const calendarDays = [];
        const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < emptyDays; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border border-borderFill"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(
                <div
                    key={day}
                    className={`text-text01 border border-borderFill flex items-center justify-center`}>
                    {day}
                </div>
            );
        }

        const totalCells = emptyDays + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        for (let i = 0; i < remainingCells; i++) {
            calendarDays.push(<div key={`empty-end-${i}`} className="border border-borderFill"></div>);
        }

        setDays(calendarDays);
    };

    useEffect(() => {
        generateCalendar();
    }, [month, year]);


    const getMonthIndex = (monthName: string) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(monthName);
    };

    return (
        <div className="h-56 w-56 grid grid-cols-7 text-center">
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Пн</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Вт</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Ср</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Чт</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Пт</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Сб</div>
            <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">Вс</div>
            {days}
        </div>
    );
};

export default CalendarComponent;
