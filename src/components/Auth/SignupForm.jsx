import React, { useState } from 'react';
import { signUp } from '../../services/authService';
import Alert from '../Common/Alert';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('kcb_live_token_2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signUp(email, password, name);
      onSuccess(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Alert type="error" message={error} />
      
      <div className="input-group">
        <label>📧 Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      
      <div className="input-group">
        <label>👤 Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      
      <div className="input-group">
        <label>🔒 Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      
      <div className="input-group">
        <label>🔑 KCB API Token</label>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
        <small>Secure token for KCB integration</small>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : '➜ Sign Up'}
      </button>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button type="button" onClick={onSwitchToLogin} className="btn-secondary">
          Already have an account? Login
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
