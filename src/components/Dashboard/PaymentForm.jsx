import React, { useState } from 'react';
import { MEDICAL_FACILITIES, PAYMENT_CHANNELS, PAYBILL_NUMBER } from '../../constants';
import Alert from '../Common/Alert';

const PaymentForm = ({ onSubmit, loading: parentLoading }) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [amount, setAmount] = useState(50000);
  const [reference, setReference] = useState('Monthly disbursement');
  const [channel, setChannel] = useState('Pesalink');
  const [token, setToken] = useState('kcb_live_token_2026');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedFacilityData = selectedFacility !== '' ? MEDICAL_FACILITIES[selectedFacility] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFacility === '') {
      setMessage({ type: 'error', text: 'Please select a facility' });
      return;
    }
    
    if (amount <= 0) {
      setMessage({ type: 'error', text: 'Valid amount required' });
      return;
    }
    
    if (!token) {
      setMessage({ type: 'error', text: 'Token required' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    const result = await onSubmit({
      facility: selectedFacilityData,
      amount,
      reference,
      channel,
      paybill: PAYBILL_NUMBER,
      token
    });
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: `✅ Transaction queued (ID: ${result.transactionId})\nBank processing via ${channel}...` 
      });
      setAmount(50000);
      setSelectedFacility('');
      setReference('Monthly disbursement');
    } else {
      setMessage({ type: 'error', text: `❌ ${result.error}` });
    }
    
    setLoading(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleReset = () => {
    setSelectedFacility('');
    setAmount(50000);
    setReference('Monthly disbursement');
    setChannel('Pesalink');
    setToken('kcb_live_token_2026');
    setMessage(null);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: '#D4AF37', marginBottom: '1rem' }}>💸 New Disbursement</h3>
      
      <Alert type={message?.type} message={message?.text} />
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>🏥 Medical Facility</label>
          <select 
            value={selectedFacility} 
            onChange={(e) => setSelectedFacility(e.target.value)}
            required
          >
            <option value="">-- Select Facility --</option>
            {MEDICAL_FACILITIES.map((facility, idx) => (
              <option key={facility.id} value={idx}>
                {facility.name} - {facility.bank}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <label>🏦 Account Details</label>
          <input 
            type="text" 
            value={selectedFacilityData ? `${selectedFacilityData.bank} | ${selectedFacilityData.account}` : ''}
            readOnly 
            placeholder="Will auto-fill"
          />
        </div>
        
        <div className="input-group">
          <label>💰 Amount (KES)</label>
          <input 
            type="number" 
            step="1000" 
            value={amount} 
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
          />
        </div>
        
        <div className="input-group">
          <label>📝 Reference</label>
          <input 
            type="text" 
            value={reference} 
            onChange={(e) => setReference(e.target.value)}
            required
          />
        </div>
        
        <div className="input-group">
          <label>⚡ Payment Channel</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            {PAYMENT_CHANNELS.map(ch => (
              <option key={ch.value} value={ch.value}>
                {ch.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <label>🔑 Confirm Token</label>
          <input 
            type="text" 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" style={{ flex: 2 }} disabled={loading || parentLoading}>
            {loading ? 'Processing...' : ' Submit to Queue'}
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary" style={{ flex: 1 }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
