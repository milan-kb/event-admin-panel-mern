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
        ? 'DASHBOARD'
        : pathname === '/events/new'
        ? 'ADD EVENT'
        : pathname.endsWith('/edit')
        ? 'UPDATE EVENT'
        : 'PAGE NOT FOUND';
    document.title = `${pageTitle} // EVENT_ADMIN`;
  }, [pathname]);

  return (
    <div className="brutal-app-layout">
      <a className="skip-link" href="#main-content">
        SKIP TO CONTENT
      </a>
      <Navbar />
      <main className="brutal-main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events/new" element={<EventForm key="new" />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route
            path="*"
            element={
              <div className="brutal-empty-block not-found-block">
                <div className="empty-icon-wrap">
                  <Icon name="close" size={36} />
                </div>
                <h2>404 // ROUTE NOT FOUND</h2>
                <p>The requested route does not map to any active endpoint.</p>
                <Link to="/" className="brutal-btn primary">
                  <span>&larr; BACK TO DASHBOARD</span>
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
