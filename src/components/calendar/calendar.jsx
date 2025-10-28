import React, { useMemo } from 'react';
import { useEvents } from '../../context/EventsContext';
import './calendar.css';

const groupByDate = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = e.dateVenue ?? 'Unknown Date';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(e);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
    .map(([date, list]) => ({ date, list }));
};

const Calendar = () => {
  const { events } = useEvents();

  const grouped = useMemo(() => groupByDate(events), [events]);

  return (
    <div className="calendar">
      {grouped.map(({ date, list }) => (
        <section key={date} className="calendar-day">
          <h2 className="day-heading">{new Date(date).toDateString()}</h2>
          <ul className="event-list">
            {list.map((e) => (
              <li key={e.id} className="event-item">
                <div className="event-meta">
                  <span className="time">{e.timeVenueUTC ?? 'TBD'}</span>
                  <span className={`status status-${e.status || 'unknown'}`}>{e.status || 'unknown'}</span>
                </div>
                <div className="teams">
                  <span className="home">{e.homeTeam?.name ?? 'TBD'}</span>
                  <span className="vs">vs</span>
                  <span className="away">{e.awayTeam?.name ?? 'TBD'}</span>
                </div>
                {/* Details navigation removed */}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {grouped.length === 0 && (
        <div className="empty">No events available.</div>
      )}
    </div>
  );
};

export default Calendar;