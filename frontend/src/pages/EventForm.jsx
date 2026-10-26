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
            err.response?.data?.message || 'FAILED TO LOAD EVENT. CHECK SYSTEM STATUS.'
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
      setError('VALIDATION ERROR: ALL 4 FIELDS ARE MANDATORY.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await api.put(`/api/events/${id}`, form);
        navigate('/', { state: { message: `EVENT "${form.name.trim().toUpperCase()}" UPDATED.` } });
      } else {
        await api.post('/api/events', form);
        navigate('/', { state: { message: `EVENT "${form.name.trim().toUpperCase()}" CREATED.` } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'SAVE FAILED. CHECK ATLAS CONNECTION.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="brutal-form-page">
      {/* Back button */}
      <div className="form-back-bar">
        <Link to="/" className="brutal-back-link">
          <Icon name="back" size={16} />
          <span>&larr; BACK TO DASHBOARD</span>
        </Link>
      </div>

      {/* Heading */}
      <section className="form-header-box">
        <div className="sticker-tag lime">
          <Icon name="ticket" size={14} />
          <span>{isEditing ? 'MODE: EDIT_RECORD' : 'MODE: CREATE_RECORD'}</span>
        </div>
        <h1 className="brutal-title">{isEditing ? 'UPDATE EVENT' : 'ADD NEW EVENT'}</h1>
        <p className="brutal-subtitle">
          {isEditing
            ? 'MODIFY SCHEDULE, VENUE, OR DESCRIPTIVE DATA IN MONGODB ATLAS.'
            : 'ENTER EVENT PARAMETERS BELOW. FORM PERSISTS DIRECTLY TO ATLAS.'}
        </p>
      </section>

      {/* Alert */}
      {error && (
        <div className="brutal-alert error" role="alert">
          <div className="alert-tag">ALERT</div>
          <span className="alert-message">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="brutal-card form-loading-card">
          <div className="brutal-loading-state">LOADING EVENT SPECIFICATIONS...</div>
        </div>
      ) : loadFailed ? (
        <div className="brutal-card empty-card text-center">
          <h3>RECORD NOT LOCATED</h3>
          <p>The specified ID does not exist in the database.</p>
          <Link to="/" className="brutal-btn primary">
            RETURN TO DASHBOARD
          </Link>
        </div>
      ) : (
        <div className="brutal-form-grid">
          {/* Main Form Box */}
          <div className="brutal-card form-main-card">
            <div className="card-badge-top yellow">INPUT FORM</div>
            <form onSubmit={handleSubmit} className="brutal-form" noValidate>
              {/* Field 1: Event Name */}
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="name">EVENT NAME</label>
                  <span className="req-tag">[MANDATORY]</span>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={120}
                  className="brutal-input"
                  placeholder="e.g. ANNUAL HACKATHON 2026"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                <span className="brutal-hint">Official title of the event (max 120 chars).</span>
              </div>

              {/* Field 2: Event Description */}
              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="description">EVENT DESCRIPTION</label>
                  <span className="req-tag">[MANDATORY]</span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  maxLength={3000}
                  className="brutal-textarea"
                  placeholder="Explain event agenda, itinerary, key speakers, eligibility..."
                  value={form.description}
                  onChange={handleChange}
                />
                <span className="brutal-hint">Comprehensive summary for prospective attendees.</span>
              </div>

              {/* Fields 3 & 4: Date and Venue (2 cols) */}
              <div className="form-columns-split">
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="date">EVENT DATE</label>
                    <span className="req-tag">[MANDATORY]</span>
                  </div>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="brutal-input"
                    value={form.date}
                    onChange={handleChange}
                  />
                  <span className="brutal-hint">Calendar date of occurrence.</span>
                </div>

                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="location">VENUE</label>
                    <span className="req-tag">[MANDATORY]</span>
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    maxLength={160}
                    className="brutal-input"
                    placeholder="e.g. MAIN AUDITORIUM / ZOOM"
                    value={form.location}
                    onChange={handleChange}
                  />
                  <span className="brutal-hint">Physical premises or virtual meeting link.</span>
                </div>
              </div>

              {/* Actions */}
              <div className="form-submit-row">
                <Link to="/" className="brutal-btn outline">
                  CANCEL
                </Link>
                <button type="submit" className="brutal-btn primary" disabled={saving}>
                  {saving ? (
                    <span>PROCESSING...</span>
                  ) : (
                    <>
                      <Icon name="check" size={16} />
                      <span>{isEditing ? 'COMMIT UPDATES' : 'PUBLISH EVENT'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Brutalist VIP Pass Aside */}
          <aside className="form-preview-aside" aria-label="Live event ticket preview">
            <div className="preview-label-tag">TICKET_PREVIEW // PASS</div>
            <div className="brutal-ticket-pass">
              <div className="ticket-punch-hole left"></div>
              <div className="ticket-punch-hole right"></div>

              <div className="ticket-top-banner">
                <span className="ticket-serial">#EVENT-REG-2026</span>
                <span className="ticket-type-badge">{isEditing ? 'EDIT_MODE' : 'VIP_PASS'}</span>
              </div>

              <div className="ticket-content">
                <div className="ticket-headline-box">
                  {form.date ? (
                    <CalendarDate value={form.date} />
                  ) : (
                    <div className="ticket-date-placeholder">
                      <Icon name="calendar" size={26} />
                    </div>
                  )}
                  <div className="ticket-title-area">
                    <span className="ticket-kicker">ADMIT ONE</span>
                    <h4 className="ticket-name">{form.name.trim() || 'EVENT TITLE HERE'}</h4>
                  </div>
                </div>

                <div className="ticket-dashed-cut"></div>

                <p className="ticket-desc-text">
                  {form.description.trim() ||
                    'Real-time event description will render dynamically here as you complete the input fields.'}
                </p>

                <div className="ticket-badge-strip">
                  <div className="ticket-spec-pill">
                    <Icon name="pin" size={13} />
                    <span>{form.location.trim() || 'VENUE_TBD'}</span>
                  </div>
                  <div className="ticket-spec-pill cyan">
                    <Icon name="users" size={13} />
                    <span>0 REGS</span>
                  </div>
                </div>

                <div className="ticket-barcode-simulation" aria-hidden="true">
                  <span>||| | | |||| || | || |||| | ||| | ||||</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
