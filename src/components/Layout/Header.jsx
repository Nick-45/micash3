import React, { useState, useEffect } from 'react';
import { PAYBILL_NUMBER } from '../../constants';

const Header = ({ user, onLogout }) => {
  const [paybillBalance, setPaybillBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch paybill balance from the backend
  const fetchPaybillBalance = async () => {
    if (!user) return;
    
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
          userId: user.uid
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaybillBalance(data.balance);
      } else {
        setError(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch balance on component mount and periodically refresh
  useEffect(() => {
    if (user) {
      fetchPaybillBalance();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchPaybillBalance, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

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
          <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
            {loading ? (
              <span style={{ color: '#888' }}>Loading...</span>
            ) : error ? (
              <span style={{ color: '#f44336', fontSize: '0.7rem' }}>⚠️ Error</span>
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
                borderRadius: '4px'
              }}
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
