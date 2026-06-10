export function pickModerator(
  queue: string[],
  vacations: Record<string, boolean>,
  applyVacation: boolean,
  assignedThisWeek: ReadonlySet<string> = new Set(),
): string | null {
  for (const name of queue) {
    if (assignedThisWeek.has(name)) {
      continue;
    }

    if (!applyVacation || !vacations[name]) {
      return name;
    }
  }

  return null;
}

export function rotateQueue(queue: string[], moderator: string): string[] {
  const index = queue.indexOf(moderator);
  if (index === -1) {
    return queue;
  }

  return [...queue.slice(0, index), ...queue.slice(index + 1), moderator];
}

export function syncQueueWithParticipants(
  queue: string[],
  participants: readonly string[],
): string[] {
  const participantSet = new Set(participants);
  const synced = queue.filter((name) => participantSet.has(name));

  for (const name of participants) {
    if (!synced.includes(name)) {
      synced.push(name);
    }
  }

  return synced;
}
