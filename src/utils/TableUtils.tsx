const createDateTimeWithoutComma = (value: Date | string, timezone: string): string => {

  const date = new Date(value);

  const formattedDate = date.toLocaleString("ru-RU", {

    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formattedDate.replace(/,/, '');
};

const createCurrencyFormat = (value: number): string => {
  return value.toString() + " ₽";
};

const createPercentFormat = (value: number): string => {
  return value.toString() + " %";
};

const DateUtils = {
  createDateTimeWithoutComma,
  createCurrencyFormat,
  createPercentFormat,
}

export default DateUtils;