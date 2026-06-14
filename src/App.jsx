import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { logout } from './services/authService';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './styles/globals.css';

function App() {
  const { user, loading } = useAuth();
  const [token, setToken] = useState('');

  const handleLogin = (accessToken) => {
    setToken(accessToken);
  };

  const handleLogout = async () => {
    await logout();
    setToken('');
  };

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#D4AF37' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <DashboardPage user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
