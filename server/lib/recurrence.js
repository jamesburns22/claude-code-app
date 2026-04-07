import {
  parseISO,
  addDays,
  addMonths,
  isAfter,
  isBefore,
  isEqual,
  getDay,
  getDate,
  format,
} from 'date-fns';

/**
 * Expand a chore's recurrence into individual occurrences within [start, end].
 * Returns array of { choreId, date (YYYY-MM-DD), assignedMemberId }
 */
export function expandOccurrences(chore, rangeStart, rangeEnd) {
  const { recurrence, assignment, id: choreId } = chore;
  const start = typeof rangeStart === 'string' ? parseISO(rangeStart) : rangeStart;
  const end = typeof rangeEnd === 'string' ? parseISO(rangeEnd) : rangeEnd;

  const choreStart = parseISO(recurrence.startDate);
  const choreEnd = recurrence.endDate ? parseISO(recurrence.endDate) : null;

  const occurrences = [];

  if (recurrence.type === 'once') {
    const d = choreStart;
    if (inRange(d, start, end) && (!choreEnd || !isAfter(d, choreEnd))) {
      occurrences.push(makeOcc(choreId, d, assignment, 0));
    }
    return occurrences;
  }

  let cursor = choreStart;
  let index = 0;

  // Advance cursor to range start if chore started before range
  if (isBefore(cursor, start)) {
    if (recurrence.type === 'daily') {
      const days = Math.floor((start - cursor) / 86400000);
      const interval = recurrence.interval || 1;
      const stepsBack = Math.floor(days / interval);
      cursor = addDays(cursor, stepsBack * interval);
      index = stepsBack;
    } else if (recurrence.type === 'weekly') {
      // Step one day at a time until we reach range start (weekly needs day-of-week matching)
      // Advance by weeks to get close
      const daysToStart = Math.floor((start - cursor) / 86400000);
      const weeks = Math.max(0, Math.floor(daysToStart / 7) - 1);
      cursor = addDays(cursor, weeks * 7);
      index += weeks * (recurrence.daysOfWeek?.length || 1);
    } else if (recurrence.type === 'monthly') {
      const months = Math.floor(
        (start.getFullYear() - cursor.getFullYear()) * 12 +
        (start.getMonth() - cursor.getMonth()) - 1
      );
      if (months > 0) {
        cursor = addMonths(cursor, months);
        index += months;
      }
    }
  }

  // Safety limit: don't generate more than 3 years of daily occurrences
  const limit = 1100;
  let iterations = 0;

  while (!isAfter(cursor, end) && iterations < limit) {
    iterations++;

    if (choreEnd && isAfter(cursor, choreEnd)) break;

    if (!isBefore(cursor, start)) {
      if (recurrence.type === 'daily') {
        occurrences.push(makeOcc(choreId, cursor, assignment, index));
      } else if (recurrence.type === 'weekly') {
        const days = recurrence.daysOfWeek || [getDay(choreStart)];
        if (days.includes(getDay(cursor))) {
          occurrences.push(makeOcc(choreId, cursor, assignment, index));
          index++;
        }
        cursor = addDays(cursor, 1);
        continue;
      } else if (recurrence.type === 'monthly') {
        const targetDay = recurrence.dayOfMonth ?? getDate(choreStart);
        if (getDate(cursor) === targetDay) {
          occurrences.push(makeOcc(choreId, cursor, assignment, index));
        }
      }
    }

    if (recurrence.type === 'daily') {
      cursor = addDays(cursor, recurrence.interval || 1);
      index++;
    } else if (recurrence.type === 'monthly') {
      cursor = addMonths(cursor, recurrence.interval || 1);
      index++;
    } else {
      cursor = addDays(cursor, 1);
    }
  }

  return occurrences;
}

function inRange(d, start, end) {
  return (isAfter(d, start) || isEqual(d, start)) &&
         (isBefore(d, end) || isEqual(d, end));
}

function makeOcc(choreId, date, assignment, index) {
  let assignedMemberId = null;

  if (assignment.type === 'fixed') {
    assignedMemberId = assignment.memberId || null;
  } else if (assignment.type === 'rotate') {
    const members = assignment.memberIds || [];
    if (members.length > 0) {
      assignedMemberId = members[index % members.length];
    }
  }

  return {
    choreId,
    date: format(date, 'yyyy-MM-dd'),
    assignedMemberId,
  };
}
