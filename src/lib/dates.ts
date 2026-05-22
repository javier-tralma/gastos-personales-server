export function parseCalendarDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

export function parseCalendarDateEnd(value: string) {
  const start = parseCalendarDate(value);
  start.setHours(23, 59, 59, 999);
  return start;
}
