import React, { useState, useEffect } from 'react';

const Header = ({ user, onLogout, accessToken }) => {
  const [paybillBalance, setPaybillBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get paybill number from environment variable
  const PAYBILL_NUMBER = process.env.SHORTCODE ;

  // Fetch paybill balance from the backend
  const fetchPaybillBalance = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    if (!accessToken) {
      setError('Access token required');
      setPaybillBalance(null);
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
          accessToken: accessToken // ✅ Pass the access token from frontend
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaybillBalance(data.balance);
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

  // Fetch balance on component mount and when accessToken changes
  useEffect(() => {
    if (user && accessToken) {
      fetchPaybillBalance();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPaybillBalance, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Reset balance when token is not available
      setPaybillBalance(null);
      setError(!accessToken ? 'Access token required' : null);
    }
  }, [user, accessToken]);

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
          gap: '12px'
        }}>
          <span style={{ color: '#D4AF37', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Paybill {PAYBILL_NUMBER}
          </span>
          <span style={{ 
            color: error ? '#f44336' : '#4caf50', 
            fontWeight: 'bold',
            fontSize: error ? '0.7rem' : 'inherit'
          }}>
            {loading ? (
              <span style={{ color: '#888' }}>Loading...</span>
            ) : error ? (
              <span>⚠️ {error}</span>
            ) : paybillBalance !== null ? (
              formatCurrency(paybillBalance)
            ) : (
              <span style={{ color: '#888' }}>N/A</span>
            )}
          </span>
          {!loading && !error && paybillBalance !== null && (
            <button
              onClick={fetchPaybillBalance}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#D4AF37'}
              onMouseLeave={(e) => e.target.style.color = '#888'}
              title="Refresh balance"
            >
              🔄
            </button>
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
