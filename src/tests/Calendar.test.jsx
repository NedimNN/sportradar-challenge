import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Calendar from '../components/calendar/calendar';

// Fixture events for a specific date: 2025-10-30 (Thu)
const testEvents = [
  {
    id: 'evt-1',
    dateVenue: '2025-10-30',
    homeTeam: { name: 'Alpha' },
    awayTeam: { name: 'Beta' },
  },
  {
    id: 'evt-2',
    dateVenue: '2025-10-30',
    homeTeam: { name: 'Gamma' },
    awayTeam: { name: 'Delta' },
  },
];

// Mock useEvents to supply our fixture data
jest.mock('../context/EventsContext', () => ({
  useEvents: () => ({ events: testEvents }),
}));

// Mock navigate while preserving actual router components
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Utility to toggle mobile behavior in tests
const setMobile = (isMobile) => {
  if (!window.matchMedia) return;
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: isMobile && /max-width:\s*640px/.test(query),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

// Pin "today" so the calendar initially renders October 2025
beforeAll(() => {
  jest.useFakeTimers();
  // Mid-October, so the initial view is October 2025
  jest.setSystemTime(new Date('2025-10-15T12:00:00'));
});

afterAll(() => {
  jest.useRealTimers();
});

const renderCalendar = () => render(
  <MemoryRouter>
    <Calendar />
  </MemoryRouter>
);

describe('Calendar', () => {
  it('renders the month header for October 2025', () => {
    setMobile(false);
    renderCalendar();
    // Month label uses Intl; we check for the word "October" and year
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/october/i);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/2025/);
  });

  it('shows a dot with correct count for a day with events', () => {
    setMobile(false);
    renderCalendar();
    // Dot uses aria-label like "2 event(s)"
    expect(screen.getByLabelText('2 event(s)')).toBeInTheDocument();
  });

  it('opens modal on mobile day click and shows friendly date label', () => {
    setMobile(true);
    renderCalendar();

    // Find the dot for the day with our events and click the containing day cell
    const dot = screen.getByLabelText('2 event(s)');
    // Climb up to the day container
    const dayCell = dot.closest('.day');
    expect(dayCell).toBeTruthy();
    fireEvent.click(dayCell);

    // Modal should appear with a friendly label: Thu 30-10-2025
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Thu 30-10-2025')).toBeInTheDocument();

    // And list our two events
    const list = screen.getByLabelText('Scheduled events for selected day');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText(/Alpha vs Beta/)).toBeInTheDocument();
    expect(within(items[1]).getByText(/Gamma vs Delta/)).toBeInTheDocument();
  });

  it('navigates to details when clicking Details in the modal', () => {
    setMobile(true);
    renderCalendar();

    // Open modal as above
    const dot = screen.getByLabelText('2 event(s)');
    const dayCell = dot.closest('.day');
    fireEvent.click(dayCell);

    // Click the Details button for the first event
    const detailsButtons = screen.getAllByRole('button', { name: /details/i });
    fireEvent.click(detailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/event/evt-1');
  });

  it('does not open modal on desktop click', () => {
    setMobile(false);
    renderCalendar();

    const dot = screen.getByLabelText('2 event(s)');
    const dayCell = dot.closest('.day');
    fireEvent.click(dayCell);

    // No dialog should appear since isMobile is false
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
