import React, { useState, useEffect } from 'react';
import StatCard from '../Common/StatCard';

const StatsGrid = ({ balance, queueSize, token, tokenExpiryTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [tokenStatus, setTokenStatus] = useState('expired');

  // Parse token expiry time (expected format: ISO string or timestamp)
  const getExpiryTime = () => {
    if (!tokenExpiryTime) return null;
    
    // If tokenExpiryTime is a Date object or ISO string
    const expiry = new Date(tokenExpiryTime);
    return expiry.getTime();
  };

  useEffect(() => {
    if (!token || !tokenExpiryTime) {
      setTimeLeft(null);
      setTokenStatus('no-token');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = getExpiryTime();
      
      if (!expiry) {
        setTimeLeft(null);
        return;
      }

      const distance = expiry - now;

      if (distance <= 0) {
        setTimeLeft(null);
        setTokenStatus('expired');
        return;
      }

      // Calculate minutes and seconds
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ minutes, seconds });
      setTokenStatus('active');
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    // Cleanup interval on unmount or when token changes
    return () => clearInterval(interval);
  }, [token, tokenExpiryTime]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const getTokenStatusDisplay = () => {
    if (!token) {
      return {
        icon: '⚫',
        text: 'No Token',
        color: '#666'
      };
    }

    if (tokenStatus === 'expired') {
      return {
        icon: '🔴',
        text: 'Expired',
        color: '#f44336'
      };
    }

    if (timeLeft && timeLeft.minutes < 5) {
      return {
        icon: '🟡',
        text: 'Expiring Soon',
        color: '#ff9800'
      };
    }

    return {
      icon: '🟢',
      text: 'Active',
      color: '#4caf50'
    };
  };

  const status = getTokenStatusDisplay();

  return (
    <div className="dashboard-grid">
      <StatCard 
        label="TARGET AMOUNT" 
        value={formatCurrency(balance)} 
        subtext="Source of truth" 
      />
      <StatCard 
        label="QUEUE SIZE" 
        value={queueSize} 
        subtext="Pending transactions" 
      />
      <div className="stat-card">
        <div className="stat-label">ACCESS TOKEN STATUS</div>
        <div className="stat-value" style={{ fontSize: '1rem', color: status.color }}>
          {status.icon} {status.text}
        </div>
        
        {/* Timer Display */}
        {timeLeft && tokenStatus === 'active' && (
          <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            ⏱️ {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
              Time remaining
            </div>
          </div>
        )}
        
        {/* Expired warning */}
        {tokenStatus === 'expired' && token && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#f44336' }}>
            ⚠️ Token expired. Please refresh.
          </div>
        )}
        
        {/* Token preview */}
        {token && (
          <div className="token-sim" style={{ marginTop: '8px', fontSize: '0.7rem', color: '#888' }}>
            Token: {token.substring(0, 15)}...
          </div>
        )}
        
        {/* No token warning */}
        {!token && (
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ff9800' }}>
            ⚠️ No token set. Enter token to proceed.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsGrid;
