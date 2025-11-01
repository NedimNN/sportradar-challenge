import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddEvent from '../pages/AddEvent';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock addSportEvent
const mockAddSportEvent = jest.fn();
jest.mock('../context/EventsContext', () => ({
  useEvents: () => ({
    addSportEvent: mockAddSportEvent,
  }),
}));

const renderAddEvent = () =>
  render(
    <MemoryRouter>
      <AddEvent />
    </MemoryRouter>
  );

describe('AddEvent', () => {
  it('renders the add event form with all required fields', () => {
    renderAddEvent();
    expect(screen.getByText('Add New Sport Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Season')).toBeInTheDocument();
    expect(screen.getByLabelText('Sport Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Date (venue)')).toBeInTheDocument();
    expect(screen.getByLabelText('Time (UTC)')).toBeInTheDocument();
  });

  it('submits the form and navigates to the new event details', async () => {
    const mockEvent = { id: 'new-evt-123' };
    mockAddSportEvent.mockReturnValue(mockEvent);

    renderAddEvent();

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Sport Name'), { target: { value: 'Football' } });
    fireEvent.change(screen.getByLabelText('Date (venue)'), { target: { value: '2025-12-15' } });
    fireEvent.change(screen.getByLabelText('Time (UTC)'), { target: { value: '18:00:00' } });
    fireEvent.change(screen.getByLabelText('Season'), { target: { value: '2025' } });

    // Fill team details
    const homeOfficialName = screen.getByLabelText('Official Name', { selector: '#homeOfficialName' });
    const awayOfficialName = screen.getByLabelText('Official Name', { selector: '#awayOfficialName' });
    fireEvent.change(homeOfficialName, { target: { value: 'FC Barcelona' } });
    fireEvent.change(awayOfficialName, { target: { value: 'Real Madrid' } });

    // Submit form
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddSportEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          sport: 'Football',
          dateVenue: '2025-12-15',
          timeVenueUTC: '18:00:00',
          season: 2025,
          homeTeam: expect.objectContaining({
            officialName: 'FC Barcelona',
            slug: 'fc-barcelona',
          }),
          awayTeam: expect.objectContaining({
            officialName: 'Real Madrid',
            slug: 'real-madrid',
          }),
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/event/new-evt-123');
    });
  });

  it('generates slugs from official team names', async () => {
    const mockEvent = { id: 'new-evt-456' };
    mockAddSportEvent.mockReturnValue(mockEvent);

    renderAddEvent();

    // Fill minimum required fields
    fireEvent.change(screen.getByLabelText('Sport Name'), { target: { value: 'Basketball' } });
    fireEvent.change(screen.getByLabelText('Date (venue)'), { target: { value: '2025-11-20' } });
    fireEvent.change(screen.getByLabelText('Time (UTC)'), { target: { value: '19:30:00' } });

    // Team names with spaces
    const homeOfficialName = screen.getByLabelText('Official Name', { selector: '#homeOfficialName' });
    const awayOfficialName = screen.getByLabelText('Official Name', { selector: '#awayOfficialName' });
    fireEvent.change(homeOfficialName, { target: { value: 'Los Angeles Lakers' } });
    fireEvent.change(awayOfficialName, { target: { value: 'Golden State Warriors' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockAddSportEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          homeTeam: expect.objectContaining({
            slug: 'los-angeles-lakers',
          }),
          awayTeam: expect.objectContaining({
            slug: 'golden-state-warriors',
          }),
        })
      );
    });
  });

  it('cancels and navigates back when Cancel button is clicked', () => {
    renderAddEvent();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
  it('shows Result section only when status is played and date/time is in the past', async () => {
    renderAddEvent();

    expect(screen.queryByLabelText('Home Goals')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Away Goals')).not.toBeInTheDocument();

    // Set a past date/time (with seconds for proper parsing)
    fireEvent.change(screen.getByLabelText('Date (venue)'), { target: { value: '2025-10-30' } });
    fireEvent.change(screen.getByLabelText('Time (UTC)'), { target: { value: '10:00:00' } });

    // Still no result section (status is not played)
    expect(screen.queryByLabelText('Home Goals')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Away Goals')).not.toBeInTheDocument();

    // Change status to played
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'played' } });

    // Wait for Result section to appear
    expect(screen.getByRole('heading', { name: 'Result' })).toBeInTheDocument();

    // Verify the form fields are also present
    expect(screen.getByLabelText('Home Goals')).toBeInTheDocument();
    expect(screen.getByLabelText('Away Goals')).toBeInTheDocument();
  });

  it('does not show Result section for future events even if status is played', async () => {
    renderAddEvent();

    // Set a future date/time
    fireEvent.change(screen.getByLabelText('Date (venue)'), { target: { value: '2125-12-30' } });
    fireEvent.change(screen.getByLabelText('Time (UTC)'), { target: { value: '20:00:00' } });
    // Change status to played
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'played' } });
    
    // Force React to process the state update
    await waitFor(() => {
      expect(statusSelect.value).toBe('played');
    });
    // Wait a bit to ensure no re-render adds the section
    await new Promise(resolve => setTimeout(resolve, 100));

    // Result section should not appear for future events
    expect(screen.queryByLabelText('Home Goals')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Away Goals')).not.toBeInTheDocument();
  });
});
