import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSchedules, getSortedArchive } from '../lib/scheduler';
import {
  isOnVacation,
  loadAppState,
  saveAppState,
  toggleVacation,
} from '../lib/storage';
import type { AppState } from '../types';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadAppState());

  const refresh = useCallback(() => {
    setState(loadAppState());
  }, []);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    const intervalId = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  const schedules = useMemo(() => getSchedules(state), [state]);
  const archive = useMemo(() => getSortedArchive(state), [state]);

  const handleToggleVacation = useCallback((participant: string) => {
    setState((current) => toggleVacation(current, participant));
  }, []);

  const isParticipantOnVacation = useCallback(
    (participant: string) => isOnVacation(state, participant),
    [state],
  );

  return {
    state,
    schedules,
    archive,
    toggleVacation: handleToggleVacation,
    isOnVacation: isParticipantOnVacation,
  };
}
