import React, { useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
});

function EventComponent({ event }) {
  const { completion, chore } = event.resource;
  return (
    <div className={`chore-event${completion ? ' done' : ''}`}>
      {completion && <span className="check">✓</span>}
      <span>{event.title}</span>
    </div>
  );
}

function eventStyleGetter(event) {
  const { chore, completion } = event.resource;
  const bg = completion
    ? lighten(chore.color, 0.4)
    : chore.color;
  return {
    style: {
      backgroundColor: bg,
      border: 'none',
      borderLeft: `3px solid ${chore.color}`,
      borderRadius: '4px',
      color: completion ? '#374151' : '#fff',
      padding: '1px 4px',
    },
  };
}

function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `rgb(${r},${g},${b})`;
}

export default function CalendarView({ occurrences, members, onSelectEvent, onRangeChange }) {
  const events = occurrences.map(occ => ({
    id: `${occ.choreId}::${occ.date}`,
    title: buildTitle(occ, members),
    start: parseISO(occ.date),
    end: parseISO(occ.date),
    allDay: true,
    resource: occ,
  }));

  const handleRangeChange = useCallback((range) => {
    if (!range) return;
    let start, end;
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else {
      start = range.start;
      end = range.end;
    }
    onRangeChange(
      format(start, 'yyyy-MM-dd'),
      format(end, 'yyyy-MM-dd')
    );
  }, [onRangeChange]);

  return (
    <div className="calendar-wrapper">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        views={['month', 'week', 'day', 'agenda']}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={onSelectEvent}
        onRangeChange={handleRangeChange}
        components={{ event: EventComponent }}
        eventPropGetter={eventStyleGetter}
        popup
      />
    </div>
  );
}

function buildTitle(occ, members) {
  const assigned = members.find(m => m.id === occ.assignedMemberId);
  return assigned ? `${occ.chore.title} · ${assigned.name}` : occ.chore.title;
}
