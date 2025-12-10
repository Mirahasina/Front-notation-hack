import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { EventsList } from './pages/admin/EventsList';
import { EventDashboard } from './pages/admin/EventDashboard';
import { ManageJuries } from './pages/admin/ManageJuries';
import { ManageCriteria } from './pages/admin/ManageCriteria';
import { ManageTeams } from './pages/admin/ManageTeams';
import { JuryScoring } from './pages/jury/JuryScoring';
import { TeamDashboard } from './pages/team/TeamDashboard';
import { PublicResults } from './pages/PublicResults';

function App() {
  const { isAuthenticated, isAdmin, isTeam } = useAuth();
  const location = useLocation();

  // Si on est sur /login et authentifié, rediriger vers le dashboard approprié
  // SAUF si on vient de se connecter (pour afficher le modal de mot de passe)
  if (location.pathname === '/login') {
    // Si authentifié, ne montrer login que si c'est une première connexion (state spécial)
    // Sinon, rediriger
    if (isAuthenticated && !location.state?.showPasswordModal) {
      if (isTeam) {
        return <Navigate to="/team/dashboard" replace />;
      } else if (isAdmin) {
        return <Navigate to="/admin/events" replace />;
      } else {
        return <Navigate to="/jury/scoring" replace />;
      }
    }
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

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

  // Routes pour les équipes
  if (isTeam) {
    return (
      <Routes>
        <Route path="/team/dashboard" element={<TeamDashboard />} />
        <Route path="/results" element={<PublicResults />} />
        <Route path="/results/:eventId" element={<PublicResults />} />
        <Route path="*" element={<Navigate to="/team/dashboard" replace />} />
      </Routes>
    );
  }

  // Routes pour les admins
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

  // Routes pour les jurys
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