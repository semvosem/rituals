export const RITUALS = [
  {
    id: 'planning',
    name: 'Планирование',
    day: 1,
    parity: 'all',
  },
  {
    id: 'design-review',
    name: 'Дизайн-ревью',
    day: 3,
    parity: 'all',
  },
  {
    id: 'tea',
    name: 'Чай',
    day: 3,
    parity: 'even',
  },
  {
    id: 'retro',
    name: 'Ретро',
    day: 5,
    parity: 'odd',
  },
] as const;

export type RitualConfig = (typeof RITUALS)[number];
export type RitualId = RitualConfig['id'];
