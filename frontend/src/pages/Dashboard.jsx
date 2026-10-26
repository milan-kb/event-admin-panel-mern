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
              'Unable to load events from the database. Please check your connection.'
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
      `Are you sure you want to delete "${eventItem.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(eventItem._id);
    setError('');
    setNotice('');

    try {
      await api.delete(`/api/events/${eventItem._id}`);
      setEvents((prev) => prev.filter((item) => item._id !== eventItem._id));
      setNotice(`"${eventItem.name}" was successfully deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event. Please try again.');
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
    <div className="dashboard-container">
      {/* Toast Notice */}
      {notice && (
        <div className="app-toast success" role="status">
          <div className="toast-icon">
            <Icon name="check" size={15} />
          </div>
          <span className="toast-message">{notice}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setNotice('')}
            aria-label="Close"
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      )}

      {error && (
        <div className="app-toast error" role="alert">
          <div className="toast-icon">
            <Icon name="close" size={15} />
          </div>
          <span className="toast-message">{error}</span>
          <button
            type="button"
            className="toast-retry"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Heading */}
      <section className="dashboard-hero-header">
        <div className="header-text">
          <div className="hero-pill-badge">
            <Icon name="zap" size={13} />
            <span>Real-time Event Management</span>
          </div>
          <h1 className="dashboard-title">Event Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage upcoming schedules, physical/virtual venues, and registration tracking in one place.
          </p>
        </div>
        <Link to="/events/new" className="btn-primary-action">
          <Icon name="plus" size={16} />
          <span>Add New Event</span>
        </Link>
      </section>

      {/* Metrics Cards Grid */}
      <section className="metrics-cards-grid" aria-label="Event statistics">
        {/* Spotlight Next Event */}
        <div className="metric-card spotlight-card">
          {loading ? (
            <div className="spotlight-loading">
              <div className="skeleton-line sm"></div>
              <div className="skeleton-line lg"></div>
              <div className="skeleton-line md"></div>
            </div>
          ) : nextEvent && !error ? (
            <div className="spotlight-content">
              <CalendarDate value={nextEvent.date} />
              <div className="spotlight-info">
                <span className="spotlight-badge">Up Next</span>
                <h3 className="spotlight-name" title={nextEvent.name}>{nextEvent.name}</h3>
                <p className="spotlight-meta">
                  <span className="meta-date">{formatDate(nextEvent.date)}</span>
                  <span className="meta-dot">·</span>
                  <span className="venue-meta">
                    <Icon name="pin" size={13} />
                    {nextEvent.location}
                  </span>
                </p>
                <Link to={`/events/${nextEvent._id}/edit`} className="spotlight-link">
                  <span>Update Event</span>
                  <Icon name="arrow" size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="spotlight-empty">
              <div className="empty-icon-wrap">
                <Icon name="calendar" size={24} />
              </div>
              <div>
                <h3>No upcoming events scheduled</h3>
                <p>Create an event to begin tracking attendees.</p>
                <Link to="/events/new" className="spotlight-link">
                  <span>Add First Event</span>
                  <Icon name="arrow" size={13} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Total Events */}
        <div className="metric-card stat-card card-indigo">
          <div className="stat-header">
            <span className="stat-label">Total Events</span>
            <div className="stat-icon-wrap indigo">
              <Icon name="calendar" size={16} />
            </div>
          </div>
          <span className="stat-value">{loading ? '—' : events.length}</span>
          <span className="stat-sub">Recorded in database</span>
        </div>

        {/* Upcoming */}
        <div className="metric-card stat-card card-emerald">
          <div className="stat-header">
            <span className="stat-label">Upcoming</span>
            <div className="stat-icon-wrap emerald">
              <Icon name="sparkle" size={16} />
            </div>
          </div>
          <span className="stat-value">{loading ? '—' : upcomingEvents.length}</span>
          <span className="stat-sub">Scheduled ahead</span>
        </div>

        {/* Total Registrations */}
        <div className="metric-card stat-card card-violet">
          <div className="stat-header">
            <span className="stat-label">Registrations</span>
            <div className="stat-icon-wrap violet">
              <Icon name="users" size={16} />
            </div>
          </div>
          <span className="stat-value">{loading ? '—' : totalRegistrations}</span>
          <span className="stat-sub">Registered attendees</span>
        </div>
      </section>

      {/* Table Section */}
      <section className="table-card-container" aria-labelledby="table-title">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="toolbar-left">
            <h2 id="table-title" className="toolbar-title">
              All Events List
            </h2>
            <span className="event-count-pill">
              {loading ? 'Loading…' : `${events.length} total`}
            </span>
          </div>

          <div className="toolbar-right">
            <div className="segmented-filter-bar" role="group" aria-label="Filter events by date">
              {[
                ['all', 'All Events'],
                ['upcoming', 'Upcoming'],
                ['past', 'Past'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-segment-btn ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="modern-search-box">
              <Icon name="search" size={15} />
              <input
                type="search"
                placeholder="Search events, venues, IDs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search events"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="table-skeleton-wrap" role="status">
            <span className="sr-only">Loading events...</span>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-row">
                <span className="sk-cell w-20"></span>
                <span className="sk-cell w-30"></span>
                <span className="sk-cell w-15"></span>
                <span className="sk-cell w-15"></span>
                <span className="sk-cell w-10"></span>
                <span className="sk-cell w-10"></span>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="modern-empty-state">
            <div className="empty-state-icon-circle">
              <Icon name={events.length ? 'search' : 'calendar'} size={30} />
            </div>
            <h3>{events.length ? 'No events match your criteria' : 'No events in database yet'}</h3>
            <p>
              {events.length
                ? 'Try clearing your search query or switching date filters.'
                : 'Click below to create your very first event and start managing registrations.'}
            </p>
            {events.length ? (
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/events/new" className="btn-primary-action">
                <Icon name="plus" size={16} />
                <span>Create First Event</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="table-scroll-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th scope="col" className="col-id">
                    Event ID
                  </th>
                  <th scope="col" className="col-name">
                    Event Name
                  </th>
                  <th scope="col" className="col-date">
                    Event Date
                  </th>
                  <th scope="col" className="col-venue">
                    Venue
                  </th>
                  <th scope="col" className="col-regs text-center">
                    Total Registrations
                  </th>
                  <th scope="col" className="col-actions text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((item) => {
                  const isPast = item.date && item.date.slice(0, 10) < todayStr;
                  const isBeingDeleted = deletingId === item._id;

                  return (
                    <tr key={item._id} className={isBeingDeleted ? 'row-deleting' : ''}>
                      {/* 1. Event ID */}
                      <td className="col-id">
                        <button
                          type="button"
                          className="id-tag-pill"
                          onClick={() => copyEventId(item._id)}
                          title="Click to copy full Event ID"
                        >
                          <span className="id-prefix">#</span>
                          <span className="id-code">{item._id.slice(-6)}</span>
                          <Icon name={copiedId === item._id ? 'check' : 'copy'} size={11} />
                        </button>
                        {copiedId === item._id && <span className="copy-badge-tip">Copied!</span>}
                      </td>

                      {/* 2. Event Name & Description */}
                      <td className="col-name">
                        <div className="event-info-stack">
                          <strong className="event-title-main">{item.name}</strong>
                          {item.description && (
                            <p className="event-desc-snippet" title={item.description}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Event Date */}
                      <td className="col-date">
                        <div className="date-badge-stack">
                          <time dateTime={item.date ? item.date.slice(0, 10) : ''} className="date-text">
                            {formatDate(item.date)}
                          </time>
                          <span className={`status-pill ${isPast ? 'past' : 'upcoming'}`}>
                            <span className="pill-dot" aria-hidden="true"></span>
                            {isPast ? 'Past Event' : 'Upcoming'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Venue */}
                      <td className="col-venue">
                        <div className="venue-cell-content">
                          <div className="venue-pin-wrap">
                            <Icon name="pin" size={13} />
                          </div>
                          <span className="venue-name-text" title={item.location}>
                            {item.location}
                          </span>
                        </div>
                      </td>

                      {/* 5. Total Registrations */}
                      <td className="col-regs text-center">
                        <span className="registration-pill">
                          <Icon name="users" size={13} />
                          <strong className="reg-number">{item.totalReg || 0}</strong>
                        </span>
                      </td>

                      {/* 6. Actions (Update & Delete) */}
                      <td className="col-actions text-right">
                        <div className="action-btns-row">
                          <Link
                            to={`/events/${item._id}/edit`}
                            className="btn-action-pill edit-btn"
                            aria-label={`Update ${item.name}`}
                          >
                            <Icon name="edit" size={13} />
                            <span>Update</span>
                          </Link>

                          <button
                            type="button"
                            className="btn-action-pill delete-btn"
                            disabled={isBeingDeleted}
                            onClick={() => handleDelete(item)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Icon name="trash" size={13} />
                            <span>{isBeingDeleted ? 'Deleting…' : 'Delete'}</span>
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

        {filteredEvents.length > 0 && (
          <div className="table-footer-bar">
            <span>
              Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong>{' '}
              {events.length === 1 ? 'event' : 'events'}
            </span>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-flex">
          <div className="footer-brand-tag">
            <div className="footer-logo-dot"></div>
            <span>Event Registration Admin Portal</span>
          </div>
          <span className="footer-tech-stack">MERN Stack · MongoDB Atlas · Express.js · React · Node.js</span>
        </div>
      </footer>
    </div>
  );
}
