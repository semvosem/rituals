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
        <h1 className={styles.heading}>Ритуалы для команды</h1>

        <div className={styles.weeks}>
          <WeekSection
            title={`Сейчас идет ${schedules.currentWeek.weekNumber} неделя`}
            schedule={schedules.currentWeek}
          />
          <WeekSection title="На следующей" schedule={schedules.nextWeek} />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.vacationButton} ${vacationOpen ? styles.vacationButtonActive : ''}`}
            onClick={() => setVacationOpen((open) => !open)}
          >
            Модератор в отпуске
          </button>
          <Link className={styles.archiveLink} to="/archive">
            Архив
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
