import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';

const Row = ({ label, children }) => (
  <div className="row" style={{ margin: '0.25rem 0' }}>
    <strong>{label}: </strong>
    <span style={{ marginLeft: 6 }}>{children}</span>
  </div>
);

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById } = useEvents();


  const event = getEventById(id);

  if (!event) {
    return (
      <div className="container">
        <h1>Event Details</h1>
        <div className="card" style={{ padding: '1rem' }}>
          <p>Event not found.</p>
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{color: 'var(--texttitle)'}}>Event Details</h1>
      <div className="card" style={{ padding: '1rem', background: 'var(--bg)' }}>
        <Row label="Date">{event.dateVenue || 'N/A'}</Row>
        <Row label="Time (UTC)">{event.timeVenueUTC || 'TBD'}</Row>
        <Row label="Status">{event.status || 'N/A'}</Row>
        <Row label="Stage">{event.stage?.name || event.stage?.id || 'N/A'}</Row>
        <Row label="Competition">{event.originCompetitionName || 'N/A'}</Row>
        <Row label="Sport">{event.sport || 'N/A'}</Row>
        <Row label="Home Team">{event.homeTeam?.officialName || event.homeTeam?.name || 'TBD'}</Row>
        <Row label="Away Team">{event.awayTeam?.officialName || event.awayTeam?.name || 'TBD'}</Row>
        {event.result && typeof event.result.homeGoals === 'number' && (
          <Row label="Result">
            {event.result.homeGoals}-{event.result.awayGoals}{event.result.winner ? ` (${event.result.winner})` : ''}
          </Row>
        )}
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: 8 }}>
        <button className="btn" style={{background: 'var(--bg)', color: 'var(--text)'}} onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default EventDetails;