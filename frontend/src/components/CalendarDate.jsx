export default function CalendarDate({ value }) {
  if (!value) return null;
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const day = date.getUTCDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();

  return (
    <time className="brutal-calendar-stamp" dateTime={typeof value === 'string' ? value.slice(0, 10) : ''}>
      <span className="stamp-month">{month}</span>
      <span className="stamp-day">{day}</span>
      <span className="stamp-weekday">{weekday}</span>
    </time>
  );
}
