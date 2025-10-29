import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventsContext';
import './calendar.css';

// Helpers for dates
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const buildMonthGrid = (year, month /* 0-based */) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startWeekday = first.getDay(); // 0 = Sun ... 6 = Sat

  // Render 6 rows of 7 days = 42 cells to cover all cases
  const cells = [];
  // Start from the Sunday of the first week containing the 1st
  const startDate = new Date(year, month, 1 - startWeekday);
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push(d);
  }

  return { first, last, daysInMonth, startWeekday, cells };
};

const Calendar = () => {
  const { events } = useEvents();
  const navigate = useNavigate();

  // Current month reference (stateful to allow navigation)
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() }); // month is 0-based
  const { year, month } = view;

  // Map scheduled events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map();
    (events || []).forEach((e) => {
      if (!e?.dateVenue) return;
      // Show any event with a valid date disregard status
      const key = e.dateVenue; // expected YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return map;
  }, [events]);

  const { cells } = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const monthLabel = useMemo(() =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(year, month, 1)),
  [year, month]);

  const weekdayLabels = useMemo(() => {
    // Start Sunday -> Saturday
    const base = new Date(2025, 9, 26); // Sunday
    return [...Array(7)].map((_, i) =>
      // Use Intl to get localized short weekday names
      new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i))
    );
  }, []);

  const handleSwitchMonth = (direction) => {
    setView((prev) => {
      const m = prev.month + direction;
      if (m < 0) return { year: prev.year - 1, month: 11 };
      if (m > 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: m };
    });
  };
  const displayDetails = (eventId) => {
    // Navigate to the dedicated Event Details page
    navigate(`/event/${eventId}`);
  }


  return (
    <div className="month">
      <div className="month-header">
        <button className="btn" onClick={() => handleSwitchMonth(-1)} style={{ border: 0 }} aria-label="Previous month">
          <i className="ri-arrow-left-double-line" style={{ color: 'black' }}></i>
        </button>
        <h2 className="month-title">{monthLabel}</h2>
        <button className="btn" onClick={() => handleSwitchMonth(1)} style={{ border: 0 }} aria-label="Next month">
          <i className="ri-arrow-right-double-line" style={{ color: 'black' }}></i>
        </button>
      </div>

      <div className="month-grid">
        {weekdayLabels.map((w) => (
          <div key={w} className="weekday" aria-hidden>
            {w}
          </div>
        ))}

        {cells.map((d, idx) => {
          const inCurrentMonth = d.getMonth() === month;
          const k = keyOf(d);
          const dayEvents = eventsByDate.get(k) || [];
          return (
            <div
              key={`${k}-${idx}`}
              className={`day${inCurrentMonth ? '' : ' outside'}`}
            >
              <div className="day-header">
                <span className="day-number">{d.getDate()}</span>
                {dayEvents.length > 0 && <span className="dot" aria-label={`${dayEvents.length} event(s)`} />}
              </div>
              {dayEvents.length > 0 && (
                <ul className="day-events" aria-label="Scheduled events">
                  {dayEvents.slice(0, 3).map((e) => (
                    <li key={e.id} className="event-chip" title={`${e.homeTeam?.name ?? 'TBD'} vs ${e.awayTeam?.name ?? 'TBD'}`}>
                      <button className="btn-event" onClick={() => displayDetails(e.id)} style={{ border: 0 }}>{e.homeTeam?.name ?? 'TBD'} vs {e.awayTeam?.name ?? 'TBD'}</button>
                    </li>
                  ))}
                  {dayEvents.length > 3 && (
                    <li className="more">+{dayEvents.length - 3} more</li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;