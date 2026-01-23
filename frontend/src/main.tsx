import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import './index.css';
import App from './App';

const CLEANUP_KEY = 'rise_cleanup_v1';
if (!localStorage.getItem(CLEANUP_KEY)) {
  const legacyKeys = [
    'jury_platform_data',
    'jury_platform_data_v2',
    'current_user',
    'current_team',
    'auth_token',
    'current_event_id'
  ];
  legacyKeys.forEach(key => localStorage.removeItem(key));
  localStorage.setItem(CLEANUP_KEY, 'done');
  console.log('Legacy storage cleared for clean session.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

