import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';

const displayDate = value => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function Dashboard() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.message || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadEvents() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/events', { signal: controller.signal });
        if (!controller.signal.aborted) setEvents(data.events);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.message || 'Could not load events. Check your connection and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadEvents();
    return () => controller.abort();
  }, [reload]);

  async function removeEvent(event) {
    if (!window.confirm(`Delete “${event.name}”? This cannot be undone.`)) return;
    setDeleting(event._id);
    setError('');
    setNotice('');
    try {
      await api.delete(`/api/events/${event._id}`);
      setEvents(current => current.filter(item => item._id !== event._id));
      setNotice(`${event.name} was deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the event. Please try again.');
    } finally {
      setDeleting('');
    }
  }

  const currentDate = today();
  const upcoming = events.filter(event => event.date.slice(0, 10) >= currentDate);
  const registrations = events.reduce((sum, event) => sum + event.totalReg, 0);
  const query = search.trim().toLowerCase();
  const visible = events.filter(event => {
    const matchesSearch = `${event.name} ${event.location} ${event._id}`.toLowerCase().includes(query);
    const isUpcoming = event.date.slice(0, 10) >= currentDate;
    return matchesSearch && (filter === 'all' || (filter === 'upcoming' ? isUpcoming : !isUpcoming));
  });

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div><p className="eyebrow">YOUR EVENT WORKSPACE</p><h1 id="dashboard-title">Make room for what’s next.</h1><p className="subtitle">A clear view of your events, venues, and registrations.</p></div>
        <Link to="/events/new" className="button primary"><span aria-hidden="true">＋</span> Add Event</Link>
      </div>

      <div className="stats-grid">
        <div className="stat"><span className="stat-label">Total events</span><strong>{loading || error ? '—' : events.length}</strong><span className="stat-detail">Across your calendar</span></div>
        <div className="stat"><span className="stat-label">Upcoming events</span><strong>{loading || error ? '—' : upcoming.length}</strong><span className="stat-detail">Today and beyond</span></div>
        <div className="stat accent"><span className="stat-label">Total registrations</span><strong>{loading || error ? '—' : registrations}</strong><span className="stat-detail">Across all events</span></div>
      </div>

      {notice && <div className="notice success" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      {error && <div className="notice error" role="alert"><span>{error}</span><button type="button" onClick={() => setReload(value => value + 1)}>Retry</button></div>}

      <div className="panel">
        <div className="panel-heading"><div><h2>Event calendar <span className="count">{events.length}</span></h2><p>Plan it. Update it. Keep everyone on the same page.</p></div><span className="section-tag">ALL YOUR EVENTS</span></div>
        <div className="toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter events">{[['all', 'All events'], ['upcoming', 'Upcoming'], ['past', 'Past']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
          <label className="search"><span className="sr-only">Search by name, venue, or event ID</span><input type="search" placeholder="Search events or venues…" value={search} onChange={event => setSearch(event.target.value)} /></label>
        </div>
        {loading ? <div className="empty-state" role="status">Loading your events…</div> : error ? <div className="empty-state">Events are temporarily unavailable. Use Retry above.</div> : visible.length === 0 ? <div className="empty-state"><span className="empty-icon" aria-hidden="true">▦</span><h3>{events.length ? 'No matching events' : 'Your next event starts here'}</h3><p>{events.length ? 'Try another search or show all events.' : 'Add your first event to start building your calendar.'}</p>{events.length ? <button className="button secondary" onClick={() => { setSearch(''); setFilter('all'); }}>Clear filters</button> : <Link className="button primary" to="/events/new">Add Event</Link>}</div> : <>
          <div className="table-scroll" role="region" aria-label="Events table" tabIndex={0}>
            <table><caption className="sr-only">Event details and management actions</caption><thead><tr><th scope="col">Event ID</th><th scope="col">Event name</th><th scope="col">Event date</th><th scope="col">Venue</th><th scope="col" className="number">Total registrations</th><th scope="col">Actions</th></tr></thead>
              <tbody>{visible.map(event => <tr key={event._id}>
                <td><span className="event-id">{event._id}</span></td>
                <td><span className="event-name">{event.name}</span><span className="event-description">{event.description}</span></td>
                <td><time dateTime={event.date.slice(0, 10)}>{displayDate(event.date)}</time><span className={`date-status ${event.date.slice(0, 10) < currentDate ? 'past' : ''}`}>{event.date.slice(0, 10) < currentDate ? 'Past event' : 'Upcoming'}</span></td>
                <td className="venue-cell">{event.location}</td><td className="number"><span className="registration-count">{event.totalReg}</span></td>
                <td><div className="row-actions"><Link className="update-link" to={`/events/${event._id}/edit`} aria-label={`Update ${event.name}`}>Update</Link><button className="delete-button" disabled={Boolean(deleting)} onClick={() => removeEvent(event)} aria-label={`Delete ${event.name}`}>{deleting === event._id ? 'Deleting…' : 'Delete'}</button></div></td>
              </tr>)}</tbody>
            </table>
          </div><div className="table-footer">Showing {visible.length} of {events.length} events<span>Dates shown as scheduled</span></div>
        </>}
      </div>
      <p className="workspace-note">A little organization. A lot of possibility.</p>
    </section>
  );
}
