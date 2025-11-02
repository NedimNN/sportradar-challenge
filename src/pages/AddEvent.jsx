import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext'


/*
Required event fields (from sample):
- season (number)
- status ("scheduled" | "played" | "postponed" | "canceled")
- sport (string)
- timeVenueUTC (string HH:mm:ss)
- dateVenue (string YYYY-MM-DD)
- stadium (string | null)
- homeTeam { name, officialName, slug, teamCountryCode }
- awayTeam { name, officialName, slug, teamCountryCode }
- result { homeGoals, awayGoals, message } (only if played, and date + time is in the past)
- stage { name, ordering }
- group (string | null)
- originCompetitionName
*/


// Create slug by replacing spaces with dashes from the official name
const toSlug = (s) => (s ? String(s).trim().replace(/\s+/g, '-').toLowerCase() : undefined);

const AddEvent = () => {
  const navigate = useNavigate();
  const { addSportEvent } = useEvents();
  const [form, setForm] = useState({
    season: '',
    status: 'scheduled',
    dateVenue: '',
    timeVenueUTC: '',
    stadium: '',
    homeTeam: {
      name: '',
      officialName: '',
      slug: '',
      abbreviation: '',
      teamCountryCode: '',
      stagePosition: ''
    },
    awayTeam: {
      name: '',
      officialName: '',
      slug: '',
      abbreviation: '',
      teamCountryCode: '',
      stagePosition: ''
    },
    result: {
      homeGoals: '',
      awayGoals: '',
      message: ''
    },
    stage: {
      id: '',
      name: '',
      ordering: ''
    },
    group: '',
    originCompetitionId: '',
    originCompetitionName: '',
    sport: ''
  });

  const onChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onNestedChange = (parent, field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  // Determine if results can be entered: only when selected date+time (UTC) is in the past
  const eventDateTimeUtc = useMemo(() => {
    const d = form.dateVenue;
    const t = form.timeVenueUTC;
    if (!d || !t) return null;
    const [y, m, day] = d.split('-').map(Number);
    const [hh = '0', mm = '0', ss = '0'] = t.split(':');
    const date = new Date(Date.UTC(y, (m || 1) - 1, day || 1, Number(hh) || 0, Number(mm) || 0, Number(ss) || 0));
    return isNaN(date.getTime()) ? null : date;
  }, [form.dateVenue, form.timeVenueUTC]);

  const canEnterResult = !!eventDateTimeUtc && eventDateTimeUtc.getTime() <= Date.now();
  
  // Only show result fields if status is 'played' and date+time is in the past
  const canShowResult = canEnterResult && form.status === 'played';

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      season: form.season ? Number(form.season) : undefined,
      status: form.status || undefined,
      timeVenueUTC: form.timeVenueUTC || undefined,
      dateVenue: form.dateVenue || undefined,
      stadium: form.stadium || null,
      homeTeam: {
        name: form.homeTeam.officialName || undefined,
        officialName: form.homeTeam.officialName || undefined,
        slug: toSlug(form.homeTeam.officialName) || undefined,
        abbreviation: form.homeTeam.abbreviation || undefined,
        teamCountryCode: form.homeTeam.teamCountryCode || undefined,
        stagePosition: form.homeTeam.stagePosition !== '' ? Number(form.homeTeam.stagePosition) : null
      },
      awayTeam: {
        name: form.awayTeam.officialName || undefined,
        officialName: form.awayTeam.officialName || undefined,
        slug: toSlug(form.awayTeam.officialName) || undefined,
        abbreviation: form.awayTeam.abbreviation || undefined,
        teamCountryCode: form.awayTeam.teamCountryCode || undefined,
        stagePosition: form.awayTeam.stagePosition !== '' ? Number(form.awayTeam.stagePosition) : null
      },
      stage: {
        id: form.stage.id || undefined,
        name: form.stage.name || undefined,
        ordering: form.stage.ordering !== '' ? Number(form.stage.ordering) : undefined
      },
      group: form.group || null,
      originCompetitionId: form.originCompetitionId || undefined,
      originCompetitionName: form.originCompetitionName || undefined,
      sport: form.sport || undefined
    };

    if (canShowResult) {
      payload.result = {
        homeGoals: form.result.homeGoals !== '' ? Number(form.result.homeGoals) : undefined,
        awayGoals: form.result.awayGoals !== '' ? Number(form.result.awayGoals) : undefined,
        message: form.result.message || null,
      };
    }

    // Save to context (and localStorage via provider)
    const saved = addSportEvent(payload);

    // Go to the new event details so the calendar and details reflect it
    navigate(`/event/${saved.id}`);
  };

  return (
    <div className="container">
      <h1 style={{ color: 'var(--texttitle)' }}>Add New Sport Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="card" >
          <section className="form-section">
            <h3>Basics</h3>

            <div className="form-row">
                <div className="form-group">
                  <label htmlFor="season">Season</label>
                  <input id="season" type="number" className="input" value={form.season} onChange={onChange('season')} placeholder="2026" />
                </div>

                <div className="form-group">
                  <label htmlFor="sport">Sport Name</label>
                  <input id="sport" type="text" className="input" value={form.sport} onChange={onChange('sport')} placeholder="Football" required />
                </div>
            </div>  

            <div className="form-row">
              <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" className="input" value={form.status} onChange={onChange('status')}>
                <option value="scheduled">scheduled</option>
                <option value="played">played</option>
                <option value="postponed">postponed</option>
                <option value="canceled">canceled</option>
              </select>
              </div>
              <div className="form-group">
                <label htmlFor="stadium">Stadium</label>
                <input id="stadium" type="text" className="input" value={form.stadium} onChange={onChange('stadium')} placeholder="Camp Nou"  />
              </div>
            </div>
            

            <div className="form-row" id="date-time-venue">
              <div className="form-group-date">
                <label htmlFor="dateVenue">Date (venue)</label>
                <input id="dateVenue" type="date" className="input-date" value={form.dateVenue} onChange={onChange('dateVenue')} required />
              </div>
              <div className="form-group-time"> 
                <label htmlFor="timeVenueUTC">Time (UTC)</label>
                <input id="timeVenueUTC" type="time" className="input-time" value={form.timeVenueUTC} onChange={onChange('timeVenueUTC')} required />
              </div>
            </div>
          </section>

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Home Team</h3>
            <div className="form-row" >
              <div className="form-group">
                <label htmlFor="homeOfficialName">Official Name</label>
                <input id="homeOfficialName" type="text" className="input" value={form.homeTeam.officialName} onChange={onNestedChange('homeTeam', 'officialName')} />
              </div>
              <div className="form-group">
                <label htmlFor="homeCountryCode">Country Code</label>
                <input id="homeCountryCode" type="text" className="input" value={form.homeTeam.teamCountryCode} onChange={onNestedChange('homeTeam', 'teamCountryCode')} placeholder="AUS, GER, ESP"  />
              </div>
            </div>
          </section>


          <section className="form-section">
            <h3>Away Team</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="awayOfficialName">Official Name</label>
                <input id="awayOfficialName" type="text" className="input" value={form.awayTeam.officialName} onChange={onNestedChange('awayTeam', 'officialName')} />
              </div>
              <div className="form-group">
                <label htmlFor="awayCountryCode">Country Code</label>
                <input id="awayCountryCode" type="text" className="input" value={form.awayTeam.teamCountryCode} onChange={onNestedChange('awayTeam', 'teamCountryCode')} placeholder="AUS, GER, ESP" />
              </div>
            </div>
          </section>


          {canShowResult && (
            
            <section className="form-section">
              <hr style={{ color: 'var(--texttitle)' }} />
              <h3>Result</h3>
              <div className="form-row" >
                <div className="form-group">
                  <label htmlFor="homeGoals">Home Goals</label>
                  <input id="homeGoals" type="number" className="input" value={form.result.homeGoals} onChange={onNestedChange('result', 'homeGoals')} />
                </div>
                <div className="form-group">
                  <label htmlFor="awayGoals">Away Goals</label>
                  <input id="awayGoals" type="number" className="input" value={form.result.awayGoals} onChange={onNestedChange('result', 'awayGoals')} />
                </div>
                <div className="form-group">
                  <label htmlFor="resultMessage">Message</label>
                  <input id="resultMessage" type="text" className="input" value={form.result.message} onChange={onNestedChange('result', 'message')} />
                </div>
              </div>
            </section>
          )}

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Stage</h3>
            <div className="form-row">
              
              <div className="form-group">
                <label htmlFor="stageName">Stage Name</label>
                <input id="stageName" type="text" className="input" value={form.stage.name} onChange={onNestedChange('stage', 'name')} placeholder='Final' />
              </div>
              <div className="form-group">
                <label htmlFor="stageOrdering">Ordering</label>
                <input id="stageOrdering" type="number" className="input" value={form.stage.ordering} onChange={onNestedChange('stage', 'ordering')} />
              </div>
            </div>
          </section>

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Competition</h3>
            <div className="form-row">

              <div className="form-group">
                <label htmlFor="competitionName">Competition Name</label>
                <input id="competitionName" type="text" className="input" value={form.originCompetitionName} onChange={onChange('originCompetitionName')} />
              </div>
              <div className="form-group">
                <label htmlFor="group">Group</label>
                <input id="group" type="text" className="input" value={form.group} onChange={onChange('group')} />
              </div>
            </div>
          </section>


        </div>

        <div className="form-actions" >
          <button type="submit" className="btn" style={{ background: 'var(--bg)', color: 'var(--text)' }}>Save</button>
          <button type="button" className="btn" style={{ background: 'var(--bg)', color: 'var(--text)' }} onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent