import React, { useState, useEffect } from 'react';

const Header = ({ user, onLogout }) => {
  const [paybillBalance, setPaybillBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Get paybill number from environment variable
  const PAYBILL_NUMBER = process.env.REACT_APP_PAYBILL_NUMBER || '522522';

  // Fetch paybill balance from the backend
  const fetchPaybillBalance = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (!accessToken) {
      setError('Please enter an access token');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/.netlify/functions/get-paybill-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paybill: PAYBILL_NUMBER,
          userId: user.uid,
          accessToken: accessToken // ✅ Pass the token from the input
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaybillBalance(data.balance);
        setError(null);
        // Auto-hide token input after successful fetch
        setShowTokenInput(false);
      } else {
        setError(data.error || 'Failed to fetch balance');
        setPaybillBalance(null);
      }
    } catch (err) {
      setError(err.message || 'Network error');
      setPaybillBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      flexWrap: 'wrap', 
      marginBottom: '20px' 
    }}>
      <div>
        <div className="logo-main" style={{ fontSize: '2rem' }}>MICASH</div>
        <div className="logo-sub">DISBURSEMENT HUB</div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Paybill Balance Display */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          padding: '8px 18px',
          borderRadius: '40px',
          border: '1px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#D4AF37', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Paybill {PAYBILL_NUMBER}
          </span>
          
          {/* Token Input - Toggleable */}
          {showTokenInput ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter access token"
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid #D4AF37',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '0.75rem',
                  width: '200px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    fetchPaybillBalance();
                  }
                }}
              />
              <button
                onClick={fetchPaybillBalance}
                disabled={loading}
                style={{
                  padding: '4px 12px',
                  background: '#4caf50',
                  border: 'none',
                  borderRadius: '20px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '...' : 'Check'}
              </button>
              <button
                onClick={() => setShowTokenInput(false)}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <span style={{ color: error ? '#f44336' : '#4caf50', fontWeight: 'bold' }}>
                {loading ? (
                  <span style={{ color: '#888' }}>Loading...</span>
                ) : error ? (
                  <span style={{ fontSize: '0.7rem' }}>⚠️ {error}</span>
                ) : paybillBalance !== null ? (
                  formatCurrency(paybillBalance)
                ) : (
                  <span style={{ color: '#888' }}>N/A</span>
                )}
              </span>
              
              {!loading && (
                <>
                  <button
                    onClick={() => setShowTokenInput(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #D4AF37',
                      color: '#D4AF37',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      padding: '2px 10px',
                      borderRadius: '12px'
                    }}
                    title="Enter token to check balance"
                  >
                    🔑 Enter Token
                  </button>
                  {!error && paybillBalance !== null && (
                    <button
                      onClick={fetchPaybillBalance}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                      title="Refresh balance"
                    >
                      🔄
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
        
        <span style={{ background: '#000000aa', padding: '8px 18px', borderRadius: '40px', color: '#D4AF37' }}>
          {user?.email}
        </span>
        <button onClick={onLogout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
};

export default Header;
