import React from 'react';
import { TRANSACTION_STATUS } from '../../constants';

const StatusBadge = ({ status }) => {
  const config = {
    [TRANSACTION_STATUS.INITIATED]: { class: 'badge-pending', label: '⏳ Initiated' },
    [TRANSACTION_STATUS.PENDING]: { class: 'badge-pending', label: '⏳ Pending' },
    [TRANSACTION_STATUS.PROCESSING]: { class: 'badge-processing', label: '🔄 Processing' },
    [TRANSACTION_STATUS.SUCCESSFUL]: { class: 'badge-success', label: '✅ Success' },
    [TRANSACTION_STATUS.FAILED]: { class: 'badge-failed', label: '❌ Failed' }
  };
  
  const { class: badgeClass, label } = config[status] || config[TRANSACTION_STATUS.INITIATED];
  
  return (
    <span className={`badge ${badgeClass}`}>
      {label}
      {status === TRANSACTION_STATUS.PROCESSING && <span className="spinner"></span>}
    </span>
  );
};

export default StatusBadge;
