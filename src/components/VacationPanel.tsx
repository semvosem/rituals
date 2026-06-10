import { VACATION_PARTICIPANTS } from '../config/participants';
import styles from './VacationPanel.module.css';

type VacationPanelProps = {
  isOpen: boolean;
  isOnVacation: (participant: string) => boolean;
  onToggle: (participant: string) => void;
};

export function VacationPanel({
  isOpen,
  isOnVacation,
  onToggle,
}: VacationPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.panel}>
      {VACATION_PARTICIPANTS.map((participant) => {
        const active = isOnVacation(participant);

        return (
          <button
            key={participant}
            type="button"
            className={`${styles.button} ${active ? styles.active : ''}`}
            onClick={() => onToggle(participant)}
          >
            {active
              ? `${participant} — в отпуске`
              : `${participant}: На этой неделе в отпуске`}
          </button>
        );
      })}
    </div>
  );
}
