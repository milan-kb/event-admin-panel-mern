import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Navbar() {
  return (
    <header className="brutal-navbar">
      <div className="nav-container">
        <Link to="/" className="brutal-brand" aria-label="Event Admin Home">
          <div className="brand-box">
            <Icon name="ticket" size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-main">EVENT_ADMIN</span>
            <span className="brand-sub">PANEL // V1.0</span>
          </div>
        </Link>

        <nav className="brutal-nav-tabs" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `brutal-tab ${isActive ? 'active' : ''}`}>
            <Icon name="calendar" size={16} />
            <span>DASHBOARD</span>
          </NavLink>
          <NavLink to="/events/new" className={({ isActive }) => `brutal-tab ${isActive ? 'active' : ''}`}>
            <Icon name="plus" size={16} />
            <span>ADD EVENT</span>
          </NavLink>
        </nav>

        <div className="brutal-status-badge">
          <span className="live-dot" aria-hidden="true"></span>
          <span>ATLAS_CONNECTED</span>
        </div>
      </div>
    </header>
  );
}
