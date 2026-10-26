import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventForm from './pages/EventForm.jsx';

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events/new" element={<EventForm key="new" />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route path="*" element={
            <div className="not-found">
              <h1>Page not found</h1>
              <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
