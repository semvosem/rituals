import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VacationPanel } from '../components/VacationPanel';
import { WeekSection } from '../components/WeekSection';
import { useAppState } from '../hooks/useAppState';
import styles from './HomePage.module.css';

export function HomePage() {
  const { schedules, toggleVacation, isOnVacation } = useAppState();
  const [vacationOpen, setVacationOpen] = useState(false);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Модераторы командных ритуалов Omni</h1>

        <div className={styles.weeks}>
          <WeekSection title="Эта неделя" schedule={schedules.currentWeek} />
          <WeekSection title="Следующая" schedule={schedules.nextWeek} />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${vacationOpen ? styles.actionButtonActive : ''}`}
            onClick={() => setVacationOpen((open) => !open)}
          >
            Выбрать отпуск
            <span
              className={`${styles.chevron} ${vacationOpen ? styles.chevronOpen : ''}`}
              aria-hidden
            />
          </button>
          <Link className={styles.actionButton} to="/archive">
            Прошедшие недели
          </Link>
        </div>

        <VacationPanel
          isOpen={vacationOpen}
          isOnVacation={isOnVacation}
          onToggle={toggleVacation}
        />
      </div>
    </main>
  );
}
