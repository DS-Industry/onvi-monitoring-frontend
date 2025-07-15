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
  schedule,
}: Props) => {
  const [days, setDays] = useState<any>([]);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [nonWorkingDays, setNonWorkingDays] = useState<number>(0);

  const generateCalendar = () => {
    const firstDay = new Date(year, getMonthIndex(month), 1).getDay();
    const daysInMonth = new Date(year, getMonthIndex(month) + 1, 0).getDate();

    const calendarDays = [];
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;

    const monthIndex = getMonthIndex(month);
    const activeDays = calculateActiveDays(
      schedule,
      daysInMonth,
      year,
      monthIndex
    );

    setWorkingDays(activeDays.length);
    setNonWorkingDays(daysInMonth - activeDays.length);

    for (let i = 0; i < emptyDays; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="border border-borderFill"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isActive = activeDays.includes(day);
      calendarDays.push(
        <div
          key={day}
          className={`text-text01 border border-borderFill flex items-center justify-center ${
            isActive ? "bg-background06" : ""
          }`}
        >
          {day}
        </div>
      );
    }

    const totalCells = emptyDays + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(
        <div key={`empty-end-${i}`} className="border border-borderFill"></div>
      );
    }

    setDays(calendarDays);
  };

  const calculateActiveDays = (
    schedule: Props["schedule"],
    daysInMonth: number,
    year: number,
    monthIndex: number
  ) => {
    const { sch, repeat, date } = schedule;
    const [startYear, startMonth, startDay] = date.split("-").map(Number);

    // If schedule starts in a future month/year, return empty
    if (
      startYear > year ||
      (startYear === year && startMonth - 1 > monthIndex)
    ) {
      return [];
    }

    const activeDays: number[] = [];
    let currentDay: number;

    if (startYear === year && startMonth - 1 === monthIndex) {
      // First month of schedule: Start from the given date
      currentDay = startDay;
    } else {
      // Find the last active day from the previous month
      const previousMonthDays = new Date(year, monthIndex, 0).getDate();
      const elapsedDays = (previousMonthDays - startDay) % (sch + repeat);
      currentDay = elapsedDays === 0 ? 1 : sch + repeat - elapsedDays;

      // If the first cycle starts past the month, adjust
      if (currentDay > daysInMonth) {
        return [];
      }
    }

    // Loop to mark active days
    while (currentDay <= daysInMonth) {
      for (let i = 0; i < sch && currentDay + i <= daysInMonth; i++) {
        activeDays.push(currentDay + i);
      }

      currentDay += sch + repeat;

      // Ensure we don't add more active days than available in the month
      if (currentDay > daysInMonth) break;
    }

    return activeDays;
  };

  useEffect(() => {
    generateCalendar();
  }, [month, year, schedule]);

  const getMonthIndex = (monthName: string) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.indexOf(monthName);
  };

  return (
    <div>
      <div className="h-56 w-56 grid grid-cols-7 text-center">
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Пн
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Вт
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Ср
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Чт
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Пт
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Сб
        </div>
        <div className="font-semibold bg-opacity01 text-text02 flex items-center justify-center">
          Вс
        </div>
        {days}
      </div>
      <div className="text-text01 text-center w-56 mt-2">
        <div className="flex justify-center">
          Рабочие дни: <div className="font-semibold">{workingDays}</div>
        </div>
        <div className="flex justify-center">
          Выходные дни: <div className="font-semibold">{nonWorkingDays}</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
