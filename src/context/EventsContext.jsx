import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import raw from '../data/data.json';

// Shape: { id, dateVenue, timeVenueUTC, homeTeam, awayTeam, status, stage, sport, ... }
const EventsContext = createContext({
  events: [],
  getEventById: () => undefined,
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
    setEvents(initial);
  }, []);

  const getEventById = (id) => events.find((e) => String(e.id) === String(id));

  const value = useMemo(() => ({ events, getEventById }), [events]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = () => useContext(EventsContext);
