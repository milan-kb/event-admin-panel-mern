import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventForm from './pages/EventForm.jsx';
import Icon from './components/Icon.jsx';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const pageTitle =
      pathname === '/'
        ? 'Dashboard'
        : pathname === '/events/new'
        ? 'Add Event'
        : pathname.endsWith('/edit')
        ? 'Update Event'
        : 'Page Not Found';
    document.title = `${pageTitle} · Event Admin`;
  }, [pathname]);

  return (
    <div className="apple-app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main className="apple-main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events/new" element={<EventForm key="new" />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route
            path="*"
            element={
              <div className="apple-empty-state not-found-card">
                <div className="empty-state-icon">
                  <Icon name="close" size={32} />
                </div>
                <h2>Page Not Found</h2>
                <p>The screen or event you requested does not exist or has been relocated.</p>
                <Link to="/" className="apple-btn-primary">
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
