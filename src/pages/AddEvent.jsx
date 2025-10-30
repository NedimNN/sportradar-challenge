import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext'
import raw from '../data/data.json'

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
        <div className="card" style={{ padding: '1rem', background: 'var(--bg)' }}>
          <section className="form-section">
            <h3>Basics</h3>

            <div className="form-row">
                <div className="form-group">
                  <label>Season</label>
                  <input type="number" className="input" value={form.season} onChange={onChange('season')} placeholder="e.g., 2026" />
                </div>

                <div className="form-group">
                  <label>Sport</label>
                  <input type="text" className="input" value={form.sport} onChange={onChange('sport')} placeholder="e.g., football" required />
                </div>
            </div>  

            <div className="form-row">
              <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={onChange('status')}>
                <option value="scheduled">scheduled</option>
                <option value="played">played</option>
                <option value="postponed">postponed</option>
                <option value="canceled">canceled</option>
              </select>
              </div>
              <div className="form-group">
                <label>Stadium</label>
                <input type="text" className="input" value={form.stadium} onChange={onChange('stadium')} placeholder="Optional" />
              </div>
            </div>
            

            <div className="form-row">
              <div className="form-group">
                <label>Date (venue)</label>
                <input type="date" className="input" value={form.dateVenue} onChange={onChange('dateVenue')} required />
              </div>
              <div className="form-group">
                <label>Time (UTC)</label>
                <input type="time" className="input" value={form.timeVenueUTC} onChange={onChange('timeVenueUTC')} required />
              </div>
            </div>
          </section>

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Home Team</h3>
            <div className="form-row" >
              <div className="form-group">
                <label>Official Name</label>
                <input type="text" className="input" value={form.homeTeam.officialName} onChange={onNestedChange('homeTeam', 'officialName')} />
              </div>
              <div className="form-group">
                <label>Country Code</label>
                <input type="text" className="input" value={form.homeTeam.teamCountryCode} onChange={onNestedChange('homeTeam', 'teamCountryCode')} />
              </div>
            </div>
          </section>


          <section className="form-section">
            <h3>Away Team</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Official Name</label>
                <input type="text" className="input" value={form.awayTeam.officialName} onChange={onNestedChange('awayTeam', 'officialName')} />
              </div>
              <div className="form-group">
                <label>Country Code</label>
                <input type="text" className="input" value={form.awayTeam.teamCountryCode} onChange={onNestedChange('awayTeam', 'teamCountryCode')} />
              </div>
            </div>
          </section>


          {canShowResult && (
            
            <section className="form-section">
              <hr style={{ color: 'var(--texttitle)' }} />
              <h3>Result</h3>
              <div className="form-row" >
                <div className="form-group">
                  <label>Home Goals</label>
                  <input type="number" className="input" value={form.result.homeGoals} onChange={onNestedChange('result', 'homeGoals')} />
                </div>
                <div className="form-group">
                  <label>Away Goals</label>
                  <input type="number" className="input" value={form.result.awayGoals} onChange={onNestedChange('result', 'awayGoals')} />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <input type="text" className="input" value={form.result.message} onChange={onNestedChange('result', 'message')} />
                </div>
              </div>
            </section>
          )}

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Stage</h3>
            <div className="form-row">
              
              <div className="form-group">
                <label>Stage Name</label>
                <input type="text" className="input" value={form.stage.name} onChange={onNestedChange('stage', 'name')} />
              </div>
              <div className="form-group">
                <label>Ordering</label>
                <input type="number" className="input" value={form.stage.ordering} onChange={onNestedChange('stage', 'ordering')} />
              </div>
            </div>
          </section>

          <hr style={{ color: 'var(--texttitle)' }} />

          <section className="form-section">
            <h3>Competition</h3>
            <div className="form-row">

              <div className="form-group">
                <label>Origin Competition Name</label>
                <input type="text" className="input" value={form.originCompetitionName} onChange={onChange('originCompetitionName')} />
              </div>
              <div className="form-group">
                <label>Group</label>
                <input type="text" className="input" value={form.group} onChange={onChange('group')} placeholder="Optional" />
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