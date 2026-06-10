export const PLANNING_MODERATOR = 'Женя';

export const ROTATION_PARTICIPANTS = ['Лиза', 'Юля', 'Илья', 'Алина'] as const;

export const VACATION_PARTICIPANTS = [
  PLANNING_MODERATOR,
  ...ROTATION_PARTICIPANTS,
] as const;

export type RotationParticipant = (typeof ROTATION_PARTICIPANTS)[number];
