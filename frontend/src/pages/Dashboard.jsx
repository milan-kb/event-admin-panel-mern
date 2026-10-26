import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import Icon from '../components/Icon.jsx';
import CalendarDate from '../components/CalendarDate.jsx';

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

function getTodayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

export default function Dashboard() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.message || '');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvents() {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/api/events', { signal: controller.signal });
        if (!controller.signal.aborted) {
          setEvents(data.events || []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.data?.message ||
              'Connection failed. Ensure backend and MongoDB Atlas are reachable.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleDelete = async (eventItem) => {
    const confirmed = window.confirm(
      `DELETE "${eventItem.name}"? THIS ACTION CANNOT BE UNDONE.`
    );
    if (!confirmed) return;

    setDeletingId(eventItem._id);
    setError('');
    setNotice('');

    try {
      await api.delete(`/api/events/${eventItem._id}`);
      setEvents((prev) => prev.filter((item) => item._id !== eventItem._id));
      setNotice(`"${eventItem.name}" WAS PERMANENTLY DELETED.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event. Check connection.');
    } finally {
      setDeletingId('');
    }
  };

  const copyEventId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const todayStr = getTodayStr();
  const upcomingEvents = events.filter((e) => e.date && e.date.slice(0, 10) >= todayStr);
  const nextEvent = upcomingEvents[0];
  const totalRegistrations = events.reduce((sum, e) => sum + (e.totalReg || 0), 0);

  const query = search.trim().toLowerCase();
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      !query ||
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.location && e.location.toLowerCase().includes(query)) ||
      (e.description && e.description.toLowerCase().includes(query)) ||
      (e._id && e._id.toLowerCase().includes(query));

    const isUpcoming = e.date && e.date.slice(0, 10) >= todayStr;
    const matchFilter =
      filter === 'all' || (filter === 'upcoming' ? isUpcoming : !isUpcoming);

    return matchSearch && matchFilter;
  });

  return (
    <div className="brutal-dashboard">
      {/* Toast Notification */}
      {notice && (
        <div className="brutal-alert success" role="status">
          <div className="alert-tag">SUCCESS</div>
          <span className="alert-message">{notice}</span>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => setNotice('')}
            aria-label="Close"
          >
            [X]
          </button>
        </div>
      )}

      {error && (
        <div className="brutal-alert error" role="alert">
          <div className="alert-tag">ERROR</div>
          <span className="alert-message">{error}</span>
          <button
            type="button"
            className="alert-retry-btn"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            RETRY
          </button>
        </div>
      )}

      {/* Hero Header */}
      <section className="brutal-hero-header">
        <div className="header-meta">
          <div className="sticker-tag">
            <Icon name="zap" size={14} />
            <span>MERN // CRUD SYSTEM ACTIVE</span>
          </div>
          <h1 className="brutal-title">EVENT DASHBOARD</h1>
          <p className="brutal-subtitle">
            CENTRALIZED ADMIN CONSOLE FOR SCHEDULES, VENUES & ATTENDEE LOGS.
          </p>
        </div>
        <Link to="/events/new" className="brutal-btn primary">
          <Icon name="plus" size={18} />
          <span>+ ADD NEW EVENT</span>
        </Link>
      </section>

      {/* Metrics Cards Grid (Neo-Brutalist High-Contrast Blocks) */}
      <section className="brutal-metrics-grid" aria-label="Event statistics">
        {/* Spotlight Card */}
        <div className="brutal-card spotlight-block">
          <div className="card-badge-top">NEXT UPCOMING</div>
          {loading ? (
            <div className="brutal-loading-box">LOADING EVENT DATA...</div>
          ) : nextEvent && !error ? (
            <div className="spotlight-inner">
              <CalendarDate value={nextEvent.date} />
              <div className="spotlight-details">
                <span className="event-kicker">FEATURED GATHERING</span>
                <h3 className="spotlight-title" title={nextEvent.name}>{nextEvent.name}</h3>
                <div className="spotlight-meta-row">
                  <span className="meta-pill">{formatDate(nextEvent.date)}</span>
                  <span className="meta-pill venue">
                    <Icon name="pin" size={13} />
                    {nextEvent.location}
                  </span>
                </div>
                <Link to={`/events/${nextEvent._id}/edit`} className="brutal-link-btn">
                  <span>UPDATE EVENT &rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="spotlight-empty-box">
              <Icon name="calendar" size={32} />
              <div>
                <h4>NO UPCOMING EVENTS</h4>
                <p>Register an event to populate the spotlight.</p>
                <Link to="/events/new" className="brutal-link-btn">
                  <span>+ CREATE FIRST EVENT</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Metric 1: Total Events (Electric Yellow) */}
        <div className="brutal-card stat-block yellow">
          <div className="stat-label-bar">
            <span>TOTAL EVENTS</span>
            <Icon name="calendar" size={18} />
          </div>
          <div className="stat-big-num">{loading ? '—' : events.length}</div>
          <div className="stat-footer-text">IN DATABASE</div>
        </div>

        {/* Metric 2: Upcoming (Neon Lime) */}
        <div className="brutal-card stat-block lime">
          <div className="stat-label-bar">
            <span>UPCOMING</span>
            <Icon name="sparkle" size={18} />
          </div>
          <div className="stat-big-num">{loading ? '—' : upcomingEvents.length}</div>
          <div className="stat-footer-text">AHEAD ON SCHEDULE</div>
        </div>

        {/* Metric 3: Registrations (Electric Cyan) */}
        <div className="brutal-card stat-block cyan">
          <div className="stat-label-bar">
            <span>REGISTRATIONS</span>
            <Icon name="users" size={18} />
          </div>
          <div className="stat-big-num">{loading ? '—' : totalRegistrations}</div>
          <div className="stat-footer-text">CONFIRMED ATTENDEES</div>
        </div>
      </section>

      {/* Main Events Table Card */}
      <section className="brutal-table-card" aria-labelledby="table-heading">
        {/* Toolbar Bar */}
        <div className="brutal-toolbar">
          <div className="toolbar-title-wrap">
            <h2 id="table-heading" className="toolbar-heading">
              EVENT DATABASE
            </h2>
            <span className="count-sticker">
              {loading ? 'SYNCING...' : `${events.length} ENTRIES`}
            </span>
          </div>

          <div className="toolbar-controls">
            {/* Filter Buttons */}
            <div className="filter-button-group" role="group" aria-label="Filter events by date">
              {[
                ['all', 'ALL'],
                ['upcoming', 'UPCOMING'],
                ['past', 'PAST'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`brutal-filter-btn ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="brutal-search-wrap">
              <Icon name="search" size={16} />
              <input
                type="search"
                placeholder="SEARCH EVENTS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search events"
              />
              {search && (
                <button
                  type="button"
                  className="search-reset"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="brutal-loading-state" role="status">
            <span>[ SYSTEM: FETCHING RECORDS FROM ATLAS... ]</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="brutal-empty-block">
            <div className="empty-icon-wrap">
              <Icon name={events.length ? 'search' : 'calendar'} size={36} />
            </div>
            <h3>{events.length ? 'NO MATCHING RECORDS FOUND' : 'NO EVENTS FOUND IN SYSTEM'}</h3>
            <p>
              {events.length
                ? 'Try revising search query or selecting a different filter.'
                : 'Click the button below to add your first event to the dashboard.'}
            </p>
            {events.length ? (
              <button
                type="button"
                className="brutal-btn yellow"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                RESET FILTERS
              </button>
            ) : (
              <Link to="/events/new" className="brutal-btn primary">
                <Icon name="plus" size={18} />
                <span>+ ADD EVENT</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive-box">
            <table className="brutal-table">
              <thead>
                <tr>
                  <th scope="col" className="col-id">EVENT ID</th>
                  <th scope="col" className="col-name">EVENT NAME</th>
                  <th scope="col" className="col-date">EVENT DATE</th>
                  <th scope="col" className="col-venue">VENUE</th>
                  <th scope="col" className="col-regs text-center">TOTAL REGISTRATIONS</th>
                  <th scope="col" className="col-actions text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((item) => {
                  const isPast = item.date && item.date.slice(0, 10) < todayStr;
                  const isBeingDeleted = deletingId === item._id;

                  return (
                    <tr key={item._id} className={isBeingDeleted ? 'row-busy' : ''}>
                      {/* 1. Event ID */}
                      <td className="col-id">
                        <button
                          type="button"
                          className="brutal-id-badge"
                          onClick={() => copyEventId(item._id)}
                          title="Click to copy full MongoDB ObjectId"
                        >
                          <span className="hash">#</span>
                          <span className="code">{item._id.slice(-6)}</span>
                          <Icon name={copiedId === item._id ? 'check' : 'copy'} size={12} />
                        </button>
                        {copiedId === item._id && <span className="copied-tag">COPIED!</span>}
                      </td>

                      {/* 2. Event Name & Description */}
                      <td className="col-name">
                        <div className="name-block">
                          <strong className="main-event-name">{item.name}</strong>
                          {item.description && (
                            <p className="main-event-desc" title={item.description}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Event Date */}
                      <td className="col-date">
                        <div className="date-cell-wrap">
                          <time dateTime={item.date ? item.date.slice(0, 10) : ''} className="bold-date">
                            {formatDate(item.date)}
                          </time>
                          <span className={`brutal-status-tag ${isPast ? 'past' : 'upcoming'}`}>
                            {isPast ? 'PAST' : 'UPCOMING'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Venue */}
                      <td className="col-venue">
                        <div className="venue-tag-box">
                          <Icon name="pin" size={14} />
                          <span title={item.location}>{item.location}</span>
                        </div>
                      </td>

                      {/* 5. Total Registrations */}
                      <td className="col-regs text-center">
                        <div className="brutal-counter-pill">
                          <Icon name="users" size={13} />
                          <span>{item.totalReg || 0}</span>
                        </div>
                      </td>

                      {/* 6. Actions (Update & Delete) */}
                      <td className="col-actions text-right">
                        <div className="action-button-pair">
                          <Link
                            to={`/events/${item._id}/edit`}
                            className="brutal-action-btn update"
                            aria-label={`Update ${item.name}`}
                          >
                            <Icon name="edit" size={13} />
                            <span>UPDATE</span>
                          </Link>

                          <button
                            type="button"
                            className="brutal-action-btn delete"
                            disabled={isBeingDeleted}
                            onClick={() => handleDelete(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Icon name="trash" size={13} />
                            <span>{isBeingDeleted ? 'DELETING…' : 'DELETE'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {filteredEvents.length > 0 && (
          <div className="brutal-table-footer">
            <span>
              TOTAL DISPLAYED: <strong>{filteredEvents.length}</strong> / <strong>{events.length}</strong> RECORDS
            </span>
          </div>
        )}
      </section>

      {/* Footer Banner */}
      <footer className="brutal-footer">
        <div className="footer-bar">
          <div className="footer-left">
            <span className="status-square"></span>
            <strong>EVENT_ADMIN // MERN STACK ASSESSMENT</strong>
          </div>
          <span className="footer-specs">MONGODB ATLAS &middot; EXPRESS &middot; REACT 19 &middot; NODE</span>
        </div>
      </footer>
    </div>
  );
}
