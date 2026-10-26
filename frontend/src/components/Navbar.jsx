import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand"><span className="brand-icon" aria-hidden="true">g.</span><span>gather<span className="brand-caption">EVENT ADMINISTRATION</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation"><NavLink to="/" end>Dashboard</NavLink><NavLink to="/events/new">Add Event</NavLink></nav>
        <span className="admin-label"><span aria-hidden="true">A</span>Admin workspace</span>
      </div>
    </header>
  );
}
