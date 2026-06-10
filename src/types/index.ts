import type { RitualId } from '../config/rituals';

export type RitualArchiveEvent = {
  type: 'ritual';
  date: string;
  ritualId: RitualId;
  ritualName: string;
  moderator: string;
};

export type VacationArchiveEvent = {
  type: 'vacation';
  weekKey: string;
  isoWeek: number;
  participants: string[];
};

export type QueueChangeArchiveEvent = {
  type: 'queue_change';
  date: string;
  ritualName: string;
  moderator: string;
  queue: string[];
};

export type ArchiveEvent =
  | RitualArchiveEvent
  | VacationArchiveEvent
  | QueueChangeArchiveEvent;

export type VacationState = {
  isoWeek: number;
  isoWeekYear: number;
  participants: Record<string, boolean>;
};

export type AppMeta = {
  lastArchivedWeekStart: string | null;
  installedAtWeekStart: string;
  vacationSnapshots: Record<string, Record<string, boolean>>;
};

export type AppState = {
  queue: string[];
  archive: ArchiveEvent[];
  vacation: VacationState;
  meta: AppMeta;
};

export type ScheduledRitual = {
  id: RitualId;
  name: string;
  date: Date;
  moderator: string | null;
};

export type WeekSchedule = {
  weekNumber: number;
  weekStart: Date;
  rituals: ScheduledRitual[];
};

export type LegacyHistoryEntry = {
  date: string;
  moderator: string;
  ritualId: RitualId;
  ritualName: string;
};

export type LegacyRitualState = {
  queue: string[];
  history: LegacyHistoryEntry[];
};

export type LegacyAppState = {
  queue?: string[];
  archive?: ArchiveEvent[];
  rituals?: Record<string, LegacyRitualState>;
  planningHistory?: LegacyHistoryEntry[];
  vacation?: VacationState;
  meta?: Partial<AppMeta>;
};
