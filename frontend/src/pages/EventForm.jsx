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
        <Link to="/" className="apple-back-link">
          <Icon name="back" size={15} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Heading */}
      <section className="form-hero-header">
        <h1 className="apple-title">{isEditing ? 'Update Event' : 'Add New Event'}</h1>
        <p className="apple-subtitle">
          {isEditing
            ? 'Modify details, venue, or schedule for this existing event.'
            : 'Fill in the event credentials below to publish it to the dashboard.'}
        </p>
      </section>

      {/* Error alert */}
      {error && (
        <div className="apple-toast error" role="alert">
          <div className="toast-icon">
            <Icon name="close" size={15} />
          </div>
          <span className="toast-message">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="apple-card form-loading-card">
          <div className="skeleton-line lg"></div>
          <div className="skeleton-line md"></div>
          <div className="skeleton-line sm"></div>
        </div>
      ) : loadFailed ? (
        <div className="apple-card empty-card text-center">
          <h3>Event not found</h3>
          <p>The requested event could not be found or loaded.</p>
          <Link to="/" className="apple-btn-primary">
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="form-layout-grid">
          {/* Main Form */}
          <div className="apple-card form-card">
            <form onSubmit={handleSubmit} className="apple-event-form" noValidate>
              {/* Field 1: Event Name */}
              <div className="form-field-group">
                <label htmlFor="name" className="field-label">
                  Event Name <span className="req-star">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  className="apple-input"
                  placeholder="e.g. Annual Tech Summit 2026"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                <span className="field-hint">Give your event a clear, recognizable name.</span>
              </div>

              {/* Field 2: Event Description */}
              <div className="form-field-group">
                <label htmlFor="description" className="field-label">
                  Event Description <span className="req-star">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  maxLength={3000}
                  className="apple-textarea"
                  placeholder="Describe the schedule, key speakers, target audience, and agenda..."
                  value={form.description}
                  onChange={handleChange}
                />
                <span className="field-hint">Brief overview of what attendees should anticipate.</span>
              </div>

              {/* Fields 3 & 4: Date and Venue (2 columns) */}
              <div className="form-row-two-col">
                <div className="form-field-group">
                  <label htmlFor="date" className="field-label">
                    Event Date <span className="req-star">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="apple-input"
                    value={form.date}
                    onChange={handleChange}
                  />
                  <span className="field-hint">Scheduled date of occurrence.</span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="location" className="field-label">
                    Venue <span className="req-star">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    maxLength={160}
                    className="apple-input"
                    placeholder="e.g. Main Auditorium, Block A"
                    value={form.location}
                    onChange={handleChange}
                  />
                  <span className="field-hint">Physical hall or virtual platform link.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="form-actions-bar">
                <Link to="/" className="apple-btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="apple-btn-primary" disabled={saving}>
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
          <aside className="form-preview-aside" aria-label="Live event card preview">
            <div className="preview-label">Live Card Preview</div>
            <div className="apple-card live-ticket-card">
              <div className="ticket-header">
                {form.date ? (
                  <CalendarDate value={form.date} />
                ) : (
                  <div className="calendar-date-placeholder">
                    <Icon name="calendar" size={24} />
                  </div>
                )}
                <div className="ticket-title-group">
                  <span className="ticket-tag">{isEditing ? 'Editing Mode' : 'New Event'}</span>
                  <h4 className="ticket-title">{form.name.trim() || 'Your Event Title Here'}</h4>
                </div>
              </div>

              <div className="ticket-body">
                <p className="ticket-desc">
                  {form.description.trim() ||
                    'Event description will dynamically preview here as you type in the form.'}
                </p>

                <div className="ticket-meta-row">
                  <div className="ticket-meta-item">
                    <Icon name="pin" size={13} />
                    <span>{form.location.trim() || 'Venue location'}</span>
                  </div>
                  <div className="ticket-meta-item">
                    <Icon name="users" size={13} />
                    <span>0 Registrations</span>
                  </div>
                </div>
              </div>

              <div className="ticket-footer">
                <span className="ticket-footnote">
                  <Icon name="appleLogo" size={12} />
                  <span>Event Registration Admin</span>
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
