import {
  addDays,
  addWeeks,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
} from 'date-fns';

export function getWeekKey(date: Date): string {
  return `${getISOWeekYear(date)}-W${getISOWeek(date)}`;
}

export function getIsoWeekInfo(date: Date) {
  return {
    isoWeek: getISOWeek(date),
    isoWeekYear: getISOWeekYear(date),
    weekStart: startOfISOWeek(date),
    weekKey: getWeekKey(date),
  };
}

export function isEvenIsoWeek(date: Date): boolean {
  return getISOWeek(date) % 2 === 0;
}

export function formatRitualDate(date: Date): string {
  return format(date, 'dd.MM');
}

export function getRitualDate(weekStart: Date, dayOfWeek: number): Date {
  return addDays(weekStart, dayOfWeek - 1);
}

export function iteratePastWeekStarts(
  lastArchivedWeekStart: string | null,
  currentWeekStart: Date,
  installedAtWeekStart: string,
): Date[] {
  const weeks: Date[] = [];
  let cursor = lastArchivedWeekStart
    ? addWeeks(new Date(lastArchivedWeekStart), 1)
    : new Date(installedAtWeekStart);

  while (cursor < currentWeekStart) {
    weeks.push(new Date(cursor));
    cursor = addWeeks(cursor, 1);
  }

  return weeks;
}
