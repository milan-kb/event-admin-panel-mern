import Event from '../models/event.js';

function eventFields(body) {
  const input = body && typeof body === 'object' ? body : {};
  const fields = {};
  for (const [key, label, limit] of [['name', 'Event name', 120], ['description', 'Description', 3000], ['location', 'Venue', 160]]) {
    if (typeof input[key] !== 'string' || !input[key].trim()) {
      const error = new Error(`${label} is required.`);
      error.status = 400;
      throw error;
    }
    if (input[key].trim().length > limit) {
      const error = new Error(`${label} must be ${limit} characters or fewer.`);
      error.status = 400;
      throw error;
    }
    fields[key] = input[key].trim();
  }
  const date = typeof input.date === 'string' ? input.date : '';
  const parsed = new Date(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    const error = new Error('Choose a valid event date in YYYY-MM-DD format.');
    error.status = 400;
    throw error;
  }
  fields.date = parsed;
  return fields;
}

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create(eventFields(req.body));
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
}

export async function getEvents(req, res, next) {
  try {
    const events = await Event.find().sort({ date: 1, _id: 1 });
    res.json({ events });
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const fields = eventFields(req.body);
    const event = await Event.findByIdAndUpdate(req.params.id, fields, { returnDocument: 'after', runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
}
