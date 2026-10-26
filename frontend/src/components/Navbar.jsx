import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Navbar() {
  return (
    <header className="apple-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" aria-label="Event Admin Home">
          <div className="brand-icon">
            <Icon name="appleLogo" size={17} />
          </div>
          <span className="brand-title">Event Admin</span>
          <span className="brand-badge">Portal</span>
        </Link>

        <nav className="nav-tabs" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            <Icon name="calendar" size={15} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/events/new" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            <Icon name="plus" size={15} />
            <span>Add Event</span>
          </NavLink>
        </nav>

        <div className="nav-status">
          <span className="status-dot" aria-hidden="true"></span>
          <span className="status-label">Atlas Online</span>
        </div>
      </div>
    </header>
  );
}
