import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { EventsList } from './pages/admin/EventsList';
import { EventDashboard } from './pages/admin/EventDashboard';
import { ManageJuries } from './pages/admin/ManageJuries';
import { ManageCriteria } from './pages/admin/ManageCriteria';
import { ManageTeams } from './pages/admin/ManageTeams';
import { JuryScoring } from './pages/jury/JuryScoring';
import { PublicResults } from './pages/PublicResults';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/results" element={<PublicResults />} />
        <Route path="/results/:eventId" element={<PublicResults />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/events" element={<EventsList />} />
        <Route path="/admin/event-dashboard" element={<EventDashboard />} />
        <Route path="/admin/juries" element={<ManageJuries />} />
        <Route path="/admin/criteria" element={<ManageCriteria />} />
        <Route path="/admin/teams" element={<ManageTeams />} />
        <Route path="/results" element={<PublicResults />} />
        <Route path="/results/:eventId" element={<PublicResults />} />
        <Route path="*" element={<Navigate to="/admin/events" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/jury/scoring" element={<JuryScoring />} />
      <Route path="/results" element={<PublicResults />} />
      <Route path="/results/:eventId" element={<PublicResults />} />
      <Route path="*" element={<Navigate to="/jury/scoring" replace />} />
    </Routes>
  );
}

export default App;