import React, { useState } from 'react';
import { login } from '../../services/authService';
import Alert from '../Common/Alert';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('admin@micash.com');
  const [password, setPassword] = useState('gold123');
  const [token, setToken] = useState('kcb_live_token_2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
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
        <label>🔒 Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      
      <div className="input-group">
        <label>🔑 KCB API Token</label>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
        <small>Secure token for KCB integration</small>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : '➜ Login'}
      </button>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button type="button" onClick={onSwitchToSignup} className="btn-secondary">
          Don't have an account? Sign Up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
