import React, { useState, useEffect } from "react";

type Props = {
    month: string;
    year: number;
    schedule: {
        sch: number; // Number of active days
        repeat: number; // Repetition interval
        date: string; // Start date (YYYY-MM-DD)
    };
};

const CalendarComponent: React.FC<Props> = ({
    month,
    year,
    schedule
}: Props) => {
    const [days, setDays] = useState<JSX.Element[]>([]);

    const generateCalendar = () => {
        const firstDay = new Date(year, getMonthIndex(month), 1).getDay();
        const daysInMonth = new Date(year, getMonthIndex(month) + 1, 0).getDate();

        const calendarDays = [];
        const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

        const activeDays = calculateActiveDays(schedule, daysInMonth);

        for (let i = 0; i < emptyDays; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border border-borderFill"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isActive = activeDays.includes(day);
            calendarDays.push(
                <div
                    key={day}
                    className={`text-text01 border border-borderFill flex items-center justify-center ${
                        isActive ? "bg-green-300 font-bold" : ""
                    }`}>
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

    const calculateActiveDays = (schedule: Props["schedule"], daysInMonth: number) => {
        const { sch, repeat, date } = schedule;
        const startDay = parseInt(date.split("-")[2], 10);
        const activeDays: number[] = [];
    
        let currentDay = startDay;
        
        while (currentDay <= daysInMonth) {
            for (let i = 0; i < sch && currentDay + i <= daysInMonth; i++) {
                activeDays.push(currentDay + i);
            }
    
            currentDay += sch + repeat;
        }
    
        return activeDays;
    };
    

    useEffect(() => {
        generateCalendar();
    }, [month, year, schedule]);


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
