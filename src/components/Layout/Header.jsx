import React from 'react';
import { PAYBILL_NUMBER } from '../../../constants';

const Header = ({ user, onLogout }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div>
        <div className="logo-main" style={{ fontSize: '2rem' }}>MICASH</div>
        <div className="logo-sub">DISBURSEMENT HUB</div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span className="paybill-badge">Paybill: {PAYBILL_NUMBER}</span>
        <span style={{ background: '#000000aa', padding: '8px 18px', borderRadius: '40px', color: '#D4AF37' }}>
           {user?.email}
        </span>
        <button onClick={onLogout} className="btn-secondary">Logout</button>
      </div>
    </div>
  );
};

export default Header;
