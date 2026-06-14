import React from 'react';

const Alert = ({ type, message, onClose }) => {
  if (!message) return null;
  
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && (
        <button onClick={onClose} style={{ float: 'right', background: 'none', padding: 0, marginLeft: '10px' }}>
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
