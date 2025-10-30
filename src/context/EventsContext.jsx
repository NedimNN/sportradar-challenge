import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import raw from '../data/data.json';

// Shape: { id, dateVenue, timeVenueUTC, homeTeam, awayTeam, status, stage, sport, ... }
const EventsContext = createContext({
  events: [],
  getEventById: () => undefined,
  addSportEvent: () => undefined,
});

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load initial events from data.json and assign ids if missing
    const initial = (raw?.data ?? []).map((e, idx) => ({
      id: e.id ?? `${idx}-${generateId()}`,
      ...e,
    }));
    // Load any user-added events from localStorage and merge
    let userAdded = [];
    try {
      const stored = localStorage.getItem('userEvents');
      userAdded = stored ? JSON.parse(stored) : [];
    } catch {}
    setEvents([...initial, ...userAdded]);
  }, []);

  const getEventById = (id) => events.find((e) => String(e.id) === String(id));

  const addSportEvent = (event) => {
    const newEvent = { id: generateId(), ...event };
    setEvents((prev) => {
      const next = [...prev, newEvent];
      try {
        const stored = localStorage.getItem('userEvents');
        const user = stored ? JSON.parse(stored) : [];
        localStorage.setItem('userEvents', JSON.stringify([...user, newEvent]));
      } catch {}
      return next;
    });
    return newEvent;
  };

  const value = useMemo(() => ({ events, getEventById, addSportEvent }), [events]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = () => useContext(EventsContext);
