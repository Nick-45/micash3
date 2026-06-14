import React from 'react';
import StatCard from '../Common/StatCard';

const StatsGrid = ({ balance, queueSize, token }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };


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
        <div className="stat-label">KCB API STATUS</div>
        <div className="stat-value" style={{ fontSize: '1rem' }}>🟢 Active</div>
        <div className="token-sim">Token: {token?.substring(0, 15)}...</div>
      </div>
    </div>
  );
};

export default StatsGrid;
