import { addWeeks, format } from 'date-fns';
import { PLANNING_MODERATOR, ROTATION_PARTICIPANTS } from '../config/participants';
import { RITUALS, type RitualConfig } from '../config/rituals';
import type {
  AppState,
  ArchiveEvent,
  ScheduledRitual,
  WeekSchedule,
} from '../types';
import { pickModerator, rotateQueue, syncQueueWithParticipants } from './queue';
import {
  getIsoWeekInfo,
  getRitualDate,
  getWeekKey,
  isEvenIsoWeek,
  iteratePastWeekStarts,
} from './week';

function isRitualActive(ritual: RitualConfig, weekStart: Date): boolean {
  if (ritual.parity === 'all') {
    return true;
  }

  const even = isEvenIsoWeek(weekStart);
  return ritual.parity === 'even' ? even : !even;
}

function getVacationsForWeek(
  state: AppState,
  weekKey: string,
): Record<string, boolean> {
  return state.meta.vacationSnapshots[weekKey] ?? {};
}

function pickPlanningModerator(
  queue: string[],
  vacations: Record<string, boolean>,
  applyVacation: boolean,
  assignedThisWeek: Set<string>,
): string | null {
  const zhenyaOnVacation = applyVacation && vacations[PLANNING_MODERATOR];

  if (!zhenyaOnVacation && !assignedThisWeek.has(PLANNING_MODERATOR)) {
    return PLANNING_MODERATOR;
  }

  return pickModerator(queue, vacations, applyVacation, assignedThisWeek);
}

function scheduleWeek(
  weekStart: Date,
  queue: string[],
  vacations: Record<string, boolean>,
  applyVacation: boolean,
): ScheduledRitual[] {
  const rituals: ScheduledRitual[] = [];
  const assignedThisWeek = new Set<string>();

  for (const ritual of RITUALS) {
    if (!isRitualActive(ritual, weekStart)) {
      continue;
    }

    const date = getRitualDate(weekStart, ritual.day);
    const moderator =
      ritual.id === 'planning'
        ? pickPlanningModerator(queue, vacations, applyVacation, assignedThisWeek)
        : pickModerator(queue, vacations, applyVacation, assignedThisWeek);

    if (moderator) {
      assignedThisWeek.add(moderator);
    }

    rituals.push({
      id: ritual.id,
      name: ritual.name,
      date,
      moderator,
    });
  }

  return rituals;
}

function hasVacationArchive(archive: ArchiveEvent[], weekKey: string): boolean {
  return archive.some(
    (event) => event.type === 'vacation' && event.weekKey === weekKey,
  );
}

function hasRitualArchive(
  archive: ArchiveEvent[],
  date: string,
  ritualId: string,
): boolean {
  return archive.some(
    (event) =>
      event.type === 'ritual' &&
      event.date === date &&
      event.ritualId === ritualId,
  );
}

function hasQueueChangeArchive(
  archive: ArchiveEvent[],
  date: string,
  ritualName: string,
): boolean {
  return archive.some(
    (event) =>
      event.type === 'queue_change' &&
      event.date === date &&
      event.ritualName === ritualName,
  );
}

function archiveWeek(state: AppState, weekStart: Date): AppState {
  const weekKey = getWeekKey(weekStart);
  const { isoWeek } = getIsoWeekInfo(weekStart);
  const vacations = getVacationsForWeek(state, weekKey);
  let queue = [...state.queue];
  let archive = [...state.archive];
  const scheduled = scheduleWeek(weekStart, queue, vacations, true);

  const vacationParticipants = Object.keys(vacations).filter(
    (name) => vacations[name],
  );

  if (
    vacationParticipants.length > 0 &&
    !hasVacationArchive(archive, weekKey)
  ) {
    archive.push({
      type: 'vacation',
      weekKey,
      isoWeek,
      participants: vacationParticipants,
    });
  }

  for (const item of scheduled) {
    if (!item.moderator) {
      continue;
    }

    const date = format(item.date, 'yyyy-MM-dd');

    if (!hasRitualArchive(archive, date, item.id)) {
      archive.push({
        type: 'ritual',
        date,
        ritualId: item.id,
        ritualName: item.name,
        moderator: item.moderator,
      });
    }

    if (item.moderator !== PLANNING_MODERATOR) {
      queue = rotateQueue(queue, item.moderator);

      if (!hasQueueChangeArchive(archive, date, item.name)) {
        archive.push({
          type: 'queue_change',
          date,
          ritualName: item.name,
          moderator: item.moderator,
          queue: [...queue],
        });
      }
    }
  }

  return {
    ...state,
    queue,
    archive,
    meta: {
      ...state.meta,
      lastArchivedWeekStart: weekStart.toISOString(),
    },
  };
}

function simulateCurrentWeekArchive(state: AppState): string[] {
  const { weekStart, weekKey } = getIsoWeekInfo(new Date());
  const vacations = getVacationsForWeek(state, weekKey);
  let queue = [...state.queue];
  const scheduled = scheduleWeek(weekStart, queue, vacations, true);

  for (const item of scheduled) {
    if (item.moderator && item.moderator !== PLANNING_MODERATOR) {
      queue = rotateQueue(queue, item.moderator);
    }
  }

  return queue;
}

export function processPastWeeks(state: AppState, now = new Date()): AppState {
  const { weekStart: currentWeekStart } = getIsoWeekInfo(now);
  const weeksToArchive = iteratePastWeekStarts(
    state.meta.lastArchivedWeekStart,
    currentWeekStart,
    state.meta.installedAtWeekStart,
  );

  let nextState = state;

  for (const weekStart of weeksToArchive) {
    nextState = archiveWeek(nextState, weekStart);
  }

  const { isoWeek, isoWeekYear } = getIsoWeekInfo(now);

  if (
    nextState.vacation.isoWeek !== isoWeek ||
    nextState.vacation.isoWeekYear !== isoWeekYear
  ) {
    nextState = {
      ...nextState,
      vacation: {
        isoWeek,
        isoWeekYear,
        participants: {},
      },
    };
  }

  return nextState;
}

export function buildWeekSchedule(
  state: AppState,
  weekStart: Date,
  options: { applyVacation: boolean; projectedQueue?: string[] },
): WeekSchedule {
  const { isoWeek } = getIsoWeekInfo(weekStart);
  const weekKey = getWeekKey(weekStart);
  const vacations = options.applyVacation
    ? getVacationsForWeek(state, weekKey)
    : {};
  const queue = options.projectedQueue ?? [...state.queue];

  return {
    weekNumber: isoWeek,
    weekStart,
    rituals: scheduleWeek(weekStart, queue, vacations, options.applyVacation),
  };
}

export function getSchedules(state: AppState, now = new Date()): {
  currentWeek: WeekSchedule;
  nextWeek: WeekSchedule;
} {
  const { weekStart } = getIsoWeekInfo(now);
  const nextWeekStart = addWeeks(weekStart, 1);
  const projectedQueue = simulateCurrentWeekArchive(state);

  return {
    currentWeek: buildWeekSchedule(state, weekStart, { applyVacation: true }),
    nextWeek: buildWeekSchedule(state, nextWeekStart, {
      applyVacation: false,
      projectedQueue,
    }),
  };
}

function getArchiveSortKey(event: ArchiveEvent): string {
  switch (event.type) {
    case 'ritual':
    case 'queue_change':
      return event.date;
    case 'vacation':
      return event.weekKey;
  }
}

export function getSortedArchive(state: AppState): ArchiveEvent[] {
  return [...state.archive].sort((a, b) =>
    getArchiveSortKey(b).localeCompare(getArchiveSortKey(a)),
  );
}

export function createInitialState(): AppState {
  const { isoWeek, isoWeekYear, weekStart } = getIsoWeekInfo(new Date());

  return {
    queue: [...ROTATION_PARTICIPANTS],
    archive: [],
    vacation: {
      isoWeek,
      isoWeekYear,
      participants: {},
    },
    meta: {
      lastArchivedWeekStart: null,
      installedAtWeekStart: weekStart.toISOString(),
      vacationSnapshots: {},
    },
  };
}

export function syncParticipants(state: AppState): AppState {
  return {
    ...state,
    queue: syncQueueWithParticipants(state.queue, ROTATION_PARTICIPANTS),
  };
}
