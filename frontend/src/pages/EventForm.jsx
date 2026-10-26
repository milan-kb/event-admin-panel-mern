import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';

const emptyForm = { name: '', description: '', date: '', location: '' };

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setLoadFailed(false);
    if (!id) {
      setForm(emptyForm);
      setLoading(false);
      return () => controller.abort();
    }
    async function loadEvent() {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/events/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted) setForm({ name: data.event.name, description: data.event.description, date: data.event.date.slice(0, 10), location: data.event.location });
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadFailed(true);
          setError(err.response?.data?.message || 'Could not load this event. Return to the dashboard and try again.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadEvent();
    return () => controller.abort();
  }, [id]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function saveEvent(event) {
    event.preventDefault();
    if (saving) return;
    if (!form.name.trim() || !form.description.trim() || !form.location.trim() || !form.date) {
      setError('Please complete all four fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (id) await api.put(`/api/events/${id}`, form);
      else await api.post('/api/events', form);
      navigate('/', { state: { message: id ? 'Event updated successfully.' : 'Your event was created successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the event. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-page" aria-labelledby="event-form-title">
      <Link className="back-link" to="/">← Back to Dashboard</Link>
      <div className="page-heading"><div><p className="eyebrow">{id ? 'KEEP THE DETAILS CURRENT' : 'BRING PEOPLE TOGETHER'}</p><h1 id="event-form-title">{id ? 'Update Event' : 'Add Event'}</h1><p className="subtitle">{id ? 'A change of plans? Update the details below.' : 'Give your next gathering a place on the calendar.'}</p></div></div>
      <div className="form-layout">
        <div className="panel form-panel">
          <div className="panel-heading"><div><h2>Event details</h2><p>All four fields are required.</p></div></div>
          {error && <div className="notice error form-notice" role="alert">{error}</div>}
          {loading ? <p className="empty-state" role="status">Loading event details…</p> : loadFailed ? <div className="empty-state"><Link className="button secondary" to="/">Return to Dashboard</Link></div> : <form onSubmit={saveEvent}>
            <fieldset disabled={saving}>
              <div className="field"><label htmlFor="name">Event Name <span aria-hidden="true">*</span></label><input id="name" name="name" required maxLength={120} value={form.name} onChange={changeField} placeholder="e.g. Community Design Meetup" autoComplete="off" /></div>
              <div className="field"><label htmlFor="description">Event Description <span aria-hidden="true">*</span></label><textarea id="description" name="description" rows={5} required maxLength={3000} value={form.description} onChange={changeField} placeholder="What’s the event about? What can attendees expect?" /><span className="field-hint">A short overview to help identify your event.</span></div>
              <div className="form-columns"><div className="field"><label htmlFor="date">Event Date <span aria-hidden="true">*</span></label><input id="date" name="date" type="date" required value={form.date} onChange={changeField} onInput={changeField} /></div><div className="field"><label htmlFor="location">Venue <span aria-hidden="true">*</span></label><input id="location" name="location" required maxLength={160} value={form.location} onChange={changeField} placeholder="e.g. Main Auditorium" /></div></div>
              <div className="form-actions"><button className="button primary" type="submit">{saving ? 'Saving…' : id ? 'Update Event' : 'Create Event'}</button><Link className="button secondary" to="/">Cancel</Link></div>
            </fieldset>
          </form>}
        </div>
        <aside className="form-aside"><span className="aside-symbol" aria-hidden="true">✳</span><p className="eyebrow">GOOD EVENTS START WITH THE DETAILS</p><h2>A name. A date.<br />A place to meet.</h2><p>Keep the event name clear and the venue specific. You can come back and update these details anytime.</p><div className="aside-note"><strong>Registrations</strong><p>New events start at zero registrations. Each event’s total appears on the dashboard.</p></div></aside>
      </div>
    </section>
  );
}
