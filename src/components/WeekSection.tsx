import type { WeekSchedule } from '../types';
import { formatRitualDate } from '../lib/week';
import styles from './WeekSection.module.css';

type WeekSectionProps = {
  title: string;
  schedule: WeekSchedule;
};

export function WeekSection({ title, schedule }: WeekSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {schedule.rituals.length === 0 ? (
        <p className={styles.empty}>На этой неделе ритуалов нет</p>
      ) : (
        <div className={styles.table}>
          <div className={styles.column}>
            {schedule.rituals.map((ritual) => (
              <span key={`${ritual.id}-date`} className={styles.cell}>
                {formatRitualDate(ritual.date)}
              </span>
            ))}
          </div>
          <div className={styles.column}>
            {schedule.rituals.map((ritual) => (
              <span key={`${ritual.id}-name`} className={styles.cell}>
                {ritual.name}
              </span>
            ))}
          </div>
          <div className={styles.column}>
            {schedule.rituals.map((ritual) => (
              <span key={`${ritual.id}-moderator`} className={styles.cell}>
                {ritual.moderator ?? '—'}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
