import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import { PAYBILL_NUMBER } from '../constants';

const LoginPage = ({ onLogin }) => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="glass-card" style={{ maxWidth: '480px', margin: '5vh auto', padding: '2rem' }}>
      <div className="logo-area" style={{ textAlign: 'center' }}>
        <div className="logo-main">MICASH</div>
        <div className="logo-sub">✦ REALISTIC BANKING SIMULATOR ✦</div>
        <div style={{ marginTop: '15px' }}>
          <span className="paybill-badge">Paybill: {PAYBILL_NUMBER}</span>
        </div>
      </div>
      
      {showSignup ? (
        <SignupForm 
          onSuccess={onLogin} 
          onSwitchToLogin={() => setShowSignup(false)} 
        />
      ) : (
        <LoginForm 
          onSuccess={onLogin} 
          onSwitchToSignup={() => setShowSignup(true)} 
        />
      )}
      
      <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '11px', color: '#5a5a5a' }}>
        ⚠️ Maximum 2 users allowed
      </div>
    </div>
  );
};

export default LoginPage;
