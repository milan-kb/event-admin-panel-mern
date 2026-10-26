export default function CalendarDate({ value }) {
  if (!value) return null;
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = date.getUTCDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

  return (
    <time className="apple-calendar-badge" dateTime={typeof value === 'string' ? value.slice(0, 10) : ''}>
      <span className="cal-header">{month}</span>
      <span className="cal-day">{day}</span>
      <span className="cal-footer">{weekday}</span>
    </time>
  );
}
