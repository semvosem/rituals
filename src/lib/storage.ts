import type { AppState, ArchiveEvent, LegacyAppState, LegacyHistoryEntry } from '../types';
import {
  createInitialState,
  processPastWeeks,
  syncParticipants,
} from './scheduler';
import { getIsoWeekInfo } from './week';

const STORAGE_KEY = 'rituals:app-state';

function historyToArchive(entries: LegacyHistoryEntry[]): ArchiveEvent[] {
  return entries.map((entry) => ({
    type: 'ritual' as const,
    date: entry.date,
    ritualId: entry.ritualId,
    ritualName: entry.ritualName,
    moderator: entry.moderator,
  }));
}

function migrateLegacyState(parsed: LegacyAppState): AppState {
  const { isoWeek, isoWeekYear, weekStart } = getIsoWeekInfo(new Date());

  if (parsed.queue && parsed.archive) {
    return {
      queue: parsed.queue,
      archive: parsed.archive,
      vacation: parsed.vacation ?? {
        isoWeek,
        isoWeekYear,
        participants: {},
      },
      meta: {
        lastArchivedWeekStart: parsed.meta?.lastArchivedWeekStart ?? null,
        installedAtWeekStart:
          parsed.meta?.installedAtWeekStart ?? weekStart.toISOString(),
        vacationSnapshots: parsed.meta?.vacationSnapshots ?? {},
      },
    };
  }

  const legacyQueue =
    parsed.rituals?.['design-review']?.queue ??
    parsed.rituals?.tea?.queue ??
    parsed.rituals?.retro?.queue ??
    createInitialState().queue;

  const archive: ArchiveEvent[] = [
    ...historyToArchive(parsed.planningHistory ?? []),
  ];

  if (parsed.rituals) {
    for (const ritual of Object.values(parsed.rituals)) {
      archive.push(...historyToArchive(ritual.history ?? []));
    }
  }

  return {
    queue: legacyQueue,
    archive,
    vacation: parsed.vacation ?? {
      isoWeek,
      isoWeekYear,
      participants: {},
    },
    meta: {
      lastArchivedWeekStart: parsed.meta?.lastArchivedWeekStart ?? null,
      installedAtWeekStart:
        parsed.meta?.installedAtWeekStart ?? weekStart.toISOString(),
      vacationSnapshots: parsed.meta?.vacationSnapshots ?? {},
    },
  };
}

export function loadAppState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initial = processPastWeeks(syncParticipants(createInitialState()));
    saveAppState(initial);
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as LegacyAppState;
    const migrated = migrateLegacyState(parsed);
    const synced = syncParticipants(migrated);
    const processed = processPastWeeks(synced);
    saveAppState(processed);
    return processed;
  } catch {
    const initial = processPastWeeks(syncParticipants(createInitialState()));
    saveAppState(initial);
    return initial;
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleVacation(state: AppState, participant: string): AppState {
  const { isoWeek, isoWeekYear, weekKey } = getIsoWeekInfo(new Date());
  const current =
    state.vacation.isoWeek === isoWeek &&
    state.vacation.isoWeekYear === isoWeekYear
      ? state.vacation.participants
      : {};

  const nextParticipants = {
    ...current,
    [participant]: !current[participant],
  };

  if (!nextParticipants[participant]) {
    delete nextParticipants[participant];
  }

  return {
    ...state,
    vacation: {
      isoWeek,
      isoWeekYear,
      participants: nextParticipants,
    },
    meta: {
      ...state.meta,
      vacationSnapshots: {
        ...state.meta.vacationSnapshots,
        [weekKey]: nextParticipants,
      },
    },
  };
}

export function isOnVacation(state: AppState, participant: string): boolean {
  const { isoWeek, isoWeekYear } = getIsoWeekInfo(new Date());

  if (
    state.vacation.isoWeek !== isoWeek ||
    state.vacation.isoWeekYear !== isoWeekYear
  ) {
    return false;
  }

  return Boolean(state.vacation.participants[participant]);
}
