import React from 'react';

const StatCard = ({ label, value, subtext, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-change">{subtext}</div>}
    </div>
  );
};

export default StatCard;
