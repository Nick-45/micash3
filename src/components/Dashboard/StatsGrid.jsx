import React, { useState, useEffect } from 'react';
import StatCard from '../Common/StatCard';

const StatsGrid = ({ balance, queueSize, token, onTokenExpiry }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [tokenStatus, setTokenStatus] = useState('no-token');
  const [timerRunning, setTimerRunning] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  
  // Timer settings
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Timer countdown logic
  useEffect(() => {
    if (!timerRunning || !expiryTime || !token) {
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;

      if (distance <= 0) {
        // Timer expired
        setTimeLeft(null);
        setTimerRunning(false);
        setTokenStatus('expired');
        setExpiryTime(null);
        
        if (onTokenExpiry) {
          onTokenExpiry();
        }
        return;
      }

      // Calculate hours, minutes, seconds
      const hrs = Math.floor(distance / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
      setTokenStatus('active');
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, expiryTime, token, onTokenExpiry]);

  const handleStartTimer = () => {
    if (!token) {
      alert('Please enter an access token first');
      return;
    }

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    if (totalSeconds === 0) {
      alert('Please set a timer duration greater than 0');
      return;
    }

    // Calculate expiry time
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + totalSeconds);
    
    setExpiryTime(expiry.getTime());
    setTimerRunning(true);
    setTokenStatus('active');
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimeLeft(null);
    setExpiryTime(null);
    setTokenStatus('stopped');
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(null);
    setExpiryTime(null);
    setTokenStatus('no-token');
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

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

    if (tokenStatus === 'stopped') {
      return {
        icon: '⏹️',
        text: 'Stopped',
        color: '#ff9800'
      };
    }

    if (timerRunning && timeLeft && timeLeft.minutes < 5 && timeLeft.hours === 0) {
      return {
        icon: '🟡',
        text: 'Expiring Soon',
        color: '#ff9800'
      };
    }

    if (timerRunning) {
      return {
        icon: '🟢',
        text: 'Active',
        color: '#4caf50'
      };
    }

    return {
      icon: '⚫',
      text: 'Not Started',
      color: '#666'
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
        
        {/* Timer Display when running */}
        {timerRunning && timeLeft && (
          <div style={{ marginTop: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            ⏱️ {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
              Time remaining
            </div>
          </div>
        )}
        
        {/* Timer Input Controls - Only show when timer is not running */}
        {!timerRunning && token && tokenStatus !== 'expired' && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>
              Set Timer Duration
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max="24"
                  style={{
                    width: '50px',
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                />
                <div style={{ fontSize: '0.6rem', color: '#888' }}>Hrs</div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="59"
                  style={{
                    width: '50px',
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                />
                <div style={{ fontSize: '0.6rem', color: '#888' }}>Min</div>
              </div>
              <span style={{ fontSize: '1.2rem' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <input
                  type="number"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="59"
                  style={{
                    width: '50px',
                    padding: '4px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                />
                <div style={{ fontSize: '0.6rem', color: '#888' }}>Sec</div>
              </div>
            </div>
            
            {/* Quick Set Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '4px',
              marginTop: '8px',
              marginBottom: '8px'
            }}>
              <button
                onClick={() => {
                  setHours(0);
                  setMinutes(5);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                5 min
              </button>
              <button
                onClick={() => {
                  setHours(0);
                  setMinutes(15);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                15 min
              </button>
              <button
                onClick={() => {
                  setHours(0);
                  setMinutes(30);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                30 min
              </button>
              <button
                onClick={() => {
                  setHours(1);
                  setMinutes(0);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                1 hour
              </button>
              <button
                onClick={() => {
                  setHours(2);
                  setMinutes(0);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                2 hours
              </button>
              <button
                onClick={() => {
                  setHours(6);
                  setMinutes(0);
                  setSeconds(0);
                }}
                style={{
                  padding: '3px',
                  fontSize: '0.65rem',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                6 hours
              </button>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {token && !timerRunning && tokenStatus !== 'expired' && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button
              onClick={handleStartTimer}
              style={{
                flex: 1,
                padding: '5px',
                background: '#4caf50',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Start Timer
            </button>
            <button
              onClick={handleResetTimer}
              style={{
                flex: 1,
                padding: '5px',
                background: '#9e9e9e',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        )}
        
        {/* Stop Button when timer is running */}
        {timerRunning && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button
              onClick={handleStopTimer}
              style={{
                flex: 1,
                padding: '5px',
                background: '#f44336',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Stop Timer
            </button>
          </div>
        )}
        
        {/* Expired warning */}
        {tokenStatus === 'expired' && token && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: '#f44336', marginBottom: '6px' }}>
              ⚠️ Token expired. Please refresh.
            </div>
            <button
              onClick={handleResetTimer}
              style={{
                width: '100%',
                padding: '5px',
                background: '#ff9800',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Set New Timer
            </button>
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
