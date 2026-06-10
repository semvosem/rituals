import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import type { ArchiveEvent } from '../types';
import { formatRitualDate } from '../lib/week';
import styles from './ArchivePage.module.css';

function ArchiveItem({ event }: { event: ArchiveEvent }) {
  switch (event.type) {
    case 'ritual':
      return (
        <li className={styles.item}>
          <span className={styles.badge}>Ритуал</span>
          <span className={styles.primary}>
            {format(parseISO(event.date), 'd MMMM yyyy', { locale: ru })} —{' '}
            {event.ritualName}
          </span>
          <span className={styles.secondary}>Ведущий: {event.moderator}</span>
        </li>
      );

    case 'vacation':
      return (
        <li className={styles.item}>
          <span className={styles.badge}>Отпуск</span>
          <span className={styles.primary}>Неделя {event.isoWeek}</span>
          <span className={styles.secondary}>
            В отпуске: {event.participants.join(', ')}
          </span>
        </li>
      );

    case 'queue_change':
      return (
        <li className={styles.item}>
          <span className={styles.badge}>Очередь</span>
          <span className={styles.primary}>
            После «{event.ritualName}» ({formatRitualDate(parseISO(event.date))})
          </span>
          <span className={styles.queue}>{event.queue.join(' → ')}</span>
        </li>
      );
  }
}

export function ArchivePage() {
  const { archive } = useAppState();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link className={styles.backLink} to="/">
            ← Назад
          </Link>
          <h1 className={styles.heading}>Архив</h1>
        </div>

        {archive.length === 0 ? (
          <p className={styles.empty}>Пока нет записей</p>
        ) : (
          <ul className={styles.list}>
            {archive.map((event, index) => (
              <ArchiveItem key={`${event.type}-${index}`} event={event} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
