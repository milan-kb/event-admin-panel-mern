import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import Icon from '../components/Icon.jsx';
import CalendarDate from '../components/CalendarDate.jsx';

const initialForm = {
  name: '',
  description: '',
  date: '',
  location: '',
};

export default function EventForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setLoadFailed(false);

    if (!isEditing) {
      setForm(initialForm);
      setLoading(false);
      return () => controller.abort();
    }

    async function loadEventData() {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/events/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted && data.event) {
          setForm({
            name: data.event.name || '',
            description: data.event.description || '',
            date: data.event.date ? data.event.date.slice(0, 10) : '',
            location: data.event.location || '',
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
          setError(
            err.response?.data?.message || 'Could not load event details. Please return to the dashboard.'
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEventData();
    return () => controller.abort();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.name.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
      setError('Please fill in all required fields (Event Name, Description, Date, and Venue).');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await api.put(`/api/events/${id}`, form);
        navigate('/', { state: { message: `"${form.name.trim()}" was updated successfully.` } });
      } else {
        await api.post('/api/events', form);
        navigate('/', { state: { message: `"${form.name.trim()}" was created successfully.` } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event. Please check inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page-container">
      {/* Back button */}
      <div className="form-nav-back">
        <Link to="/" className="modern-back-link">
          <Icon name="back" size={15} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Heading */}
      <section className="form-hero-header">
        <div className="hero-pill-badge indigo">
          <Icon name="ticket" size={13} />
          <span>{isEditing ? 'Modify Existing Event' : 'New Event Registration'}</span>
        </div>
        <h1 className="dashboard-title">{isEditing ? 'Update Event Details' : 'Create New Event'}</h1>
        <p className="dashboard-subtitle">
          {isEditing
            ? 'Make changes to event schedule, location, or descriptive details below.'
            : 'Fill in the information below to schedule and publish your new event.'}
        </p>
      </section>

      {/* Error alert */}
      {error && (
        <div className="app-toast error" role="alert">
          <div className="toast-icon">
            <Icon name="close" size={15} />
          </div>
          <span className="toast-message">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="form-card-container form-loading-card">
          <div className="skeleton-line lg"></div>
          <div className="skeleton-line md"></div>
          <div className="skeleton-line sm"></div>
        </div>
      ) : loadFailed ? (
        <div className="form-card-container empty-card text-center">
          <h3>Event not found</h3>
          <p>The requested event could not be located in the database.</p>
          <Link to="/" className="btn-primary-action">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="form-layout-grid">
          {/* Main Form */}
          <div className="form-card-container">
            <form onSubmit={handleSubmit} className="modern-event-form" noValidate>
              {/* Field 1: Event Name */}
              <div className="input-field-group">
                <label htmlFor="name" className="field-label">
                  Event Name <span className="req-asterisk">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  className="modern-form-input"
                  placeholder="e.g. Annual Tech Symposium 2026"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                <span className="field-hint-text">A clear, engaging name for the event.</span>
              </div>

              {/* Field 2: Event Description */}
              <div className="input-field-group">
                <label htmlFor="description" className="field-label">
                  Event Description <span className="req-asterisk">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  maxLength={3000}
                  className="modern-form-textarea"
                  placeholder="Detail the agenda, key topics, guest speakers, prerequisites..."
                  value={form.description}
                  onChange={handleChange}
                />
                <span className="field-hint-text">Brief outline of the event's purpose and expectations.</span>
              </div>

              {/* Fields 3 & 4: Date and Venue (2 columns) */}
              <div className="form-two-column-row">
                <div className="input-field-group">
                  <label htmlFor="date" className="field-label">
                    Event Date <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="modern-form-input"
                    value={form.date}
                    onChange={handleChange}
                  />
                  <span className="field-hint-text">Date the event takes place.</span>
                </div>

                <div className="input-field-group">
                  <label htmlFor="location" className="field-label">
                    Venue <span className="req-asterisk">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    maxLength={160}
                    className="modern-form-input"
                    placeholder="e.g. Auditorium Hall A, Campus 1"
                    value={form.location}
                    onChange={handleChange}
                  />
                  <span className="field-hint-text">Physical hall, room, or virtual platform URL.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="form-bottom-actions">
                <Link to="/" className="btn-secondary-action">
                  Cancel
                </Link>
                <button type="submit" className="btn-primary-action" disabled={saving}>
                  {saving ? (
                    <span>Saving…</span>
                  ) : (
                    <>
                      <Icon name="check" size={15} />
                      <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <aside className="form-preview-column" aria-label="Live event card preview">
            <div className="preview-header-label">Live Pass Preview</div>
            <div className="live-event-pass-card">
              <div className="pass-top-accent"></div>
              <div className="pass-card-content">
                <div className="pass-header-flex">
                  {form.date ? (
                    <CalendarDate value={form.date} />
                  ) : (
                    <div className="calendar-date-placeholder">
                      <Icon name="calendar" size={24} />
                    </div>
                  )}
                  <div className="pass-title-box">
                    <span className="pass-badge">{isEditing ? 'Editing Mode' : 'New Event'}</span>
                    <h4 className="pass-event-title">{form.name.trim() || 'Your Event Title Here'}</h4>
                  </div>
                </div>

                <div className="pass-divider"></div>

                <p className="pass-description-text">
                  {form.description.trim() ||
                    'Event description will dynamically preview here as you type in the form.'}
                </p>

                <div className="pass-meta-strip">
                  <div className="pass-meta-item">
                    <Icon name="pin" size={13} />
                    <span>{form.location.trim() || 'Venue location'}</span>
                  </div>
                  <div className="pass-meta-item">
                    <Icon name="users" size={13} />
                    <span>0 Registered</span>
                  </div>
                </div>

                <div className="pass-footer-strip">
                  <div className="pass-brand-tag">
                    <Icon name="ticket" size={13} />
                    <span>EventHub Portal</span>
                  </div>
                  <span className="pass-status-pill">Active Draft</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
