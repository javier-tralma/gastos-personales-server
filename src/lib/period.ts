export type PeriodRange = {
  month: number;
  start: Date;
  end: Date;
};

export function parseStartDay(value?: string) {
  const parsed = Number(value ?? 1);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 28 ? parsed : 1;
}

export function getPeriodRange(monthValue?: string, startDayValue?: string, referenceDate = new Date()): PeriodRange {
  const startDay = parseStartDay(startDayValue);
  const currentMonth = referenceDate.getFullYear() * 100 + referenceDate.getMonth() + 1;
  const previousMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const previousMonth = previousMonthDate.getFullYear() * 100 + previousMonthDate.getMonth() + 1;
  const month = monthValue ? Number(monthValue) : referenceDate.getDate() < startDay ? previousMonth : currentMonth;
  const year = Math.floor(month / 100);
  const monthIndex = (month % 100) - 1;
  const start = new Date(year, monthIndex, startDay);
  const end = new Date(year, monthIndex + 1, startDay, 0, 0, 0, -1);

  return { month, start, end };
}
