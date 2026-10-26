export default function CalendarDate({ value }) {
  if (!value) return null;
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = date.getUTCDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

  return (
    <time className="calendar-date-card" dateTime={typeof value === 'string' ? value.slice(0, 10) : ''}>
      <span className="cal-top-bar">{month}</span>
      <span className="cal-day-num">{day}</span>
      <span className="cal-weekday-text">{weekday}</span>
    </time>
  );
}
