import React, { useState, useEffect } from 'react';
import { MEDICAL_FACILITIES } from '../../constants';
import Alert from '../Common/Alert';

const PaymentForm = ({ onSubmit, loading: parentLoading }) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [amountUSD, setAmountUSD] = useState(385000);
  const [reference, setReference] = useState('Monthly disbursement');
  const [paybill, setPaybill] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Exchange rate (1 USD = 129 KES)
  const EXCHANGE_RATE = 129;
  
  // Calculate KES amount for display (handle NaN safely)
  const amountKES = !isNaN(amountUSD) && amountUSD > 0 ? Math.round(amountUSD * EXCHANGE_RATE) : 0;

  const selectedFacilityData = 
    selectedFacility !== '' ? MEDICAL_FACILITIES[selectedFacility] : null;

  // Auto-update reference and paybill when facility changes
  useEffect(() => {
    if (selectedFacilityData) {
      if (selectedFacilityData.account) {
        setReference(selectedFacilityData.account);
      }
      if (selectedFacilityData.paybill) {
        setPaybill(selectedFacilityData.paybill);
      }
    } else {
      setReference('Monthly disbursement');
      setPaybill('');
    }
  }, [selectedFacility]);

  // Handle amount change safely
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    if (cleanValue === '' || cleanValue === '.') {
      setAmountUSD(0);
    } else {
      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed) && isFinite(parsed)) {
        setAmountUSD(parsed);
      } else {
        setAmountUSD(0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFacility === '') {
      setMessage({ type: 'error', text: 'Please select a facility' });
      return;
    }

    if (amountUSD <= 0 || isNaN(amountUSD)) {
      setMessage({ type: 'error', text: 'Valid amount required' });
      return;
    }

    if (!paybill) {
      setMessage({ type: 'error', text: 'Paybill number required' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Access token required' });
      return;
    }

    if (!reference) {
      setMessage({ type: 'error', text: 'Account reference required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Convert USD to KES before submitting
    const amountKESValue = Math.round(amountUSD * EXCHANGE_RATE);

    const result = await onSubmit({
      facility: selectedFacilityData,
      amountUSD: amountUSD,
      amountKES: amountKESValue,
      reference,
      paybill: paybill,
      account: reference,
      token
    });

    if (result.success) {
      setMessage({
        type: 'success',
        text: `✅ Transaction queued (ID: ${result.transactionId})\n📤 Sent to Paybill: ${paybill}\n📋 Account: ${reference}\n💰 Amount: ${amountUSD.toLocaleString()} USD (${amountKESValue.toLocaleString()} KES)`
      });
      setAmountUSD(385000);
      setSelectedFacility('');
      setReference('Monthly disbursement');
      setPaybill('');
      setToken('');
    } else {
      setMessage({ type: 'error', text: `❌ ${result.error}` });
    }

    setLoading(false);
    setTimeout(() => setMessage(null), 6000);
  };

  const handleReset = () => {
    setSelectedFacility('');
    setAmountUSD(385000);
    setReference('Monthly disbursement');
    setPaybill('');
    setToken('');
    setMessage(null);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: '#D4AF37', marginBottom: '1rem' }}>
        New Disbursement
      </h3>

      <Alert type={message?.type} message={message?.text} />

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Medical Facility</label>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            required
          >
            <option value="">-- Select Facility --</option>
            {MEDICAL_FACILITIES.map((facility, idx) => (
              <option key={facility.id} value={idx}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Paybill Number</label>
          <input
            type="text"
            value={paybill}
            onChange={(e) => setPaybill(e.target.value)}
            required
            placeholder={selectedFacilityData?.paybill ? "Auto-loaded from facility" : "Enter paybill number"}
          />
          {selectedFacilityData?.paybill && (
            <small style={{ color: '#4CAF50', display: 'block', marginTop: '4px' }}>
              ✓ Using facility paybill: {selectedFacilityData.paybill}
            </small>
          )}
        </div>

        <div className="input-group">
          <label>Account (Reference)</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            placeholder={selectedFacilityData?.account ? "Auto-loaded from facility" : "Enter account reference"}
          />
          {selectedFacilityData?.account && (
            <small style={{ color: '#4CAF50', display: 'block', marginTop: '4px' }}>
              ✓ Using facility account reference: {selectedFacilityData.account}
            </small>
          )}
        </div>

        <div className="input-group">
          <label>Amount (USD)</label>
          <input
            type="text"
            inputMode="numeric"
            value={amountUSD === 0 ? '' : amountUSD}
            onChange={handleAmountChange}
            placeholder="Enter amount in USD"
            required
          />
          {/* Show KES conversion in real-time */}
          {amountKES > 0 && (
            <small style={{ color: '#D4AF37', display: 'block', marginTop: '4px' }}>
              ≈ {amountKES.toLocaleString()} KES (Exchange rate: 1 USD = {EXCHANGE_RATE} KES)
            </small>
          )}
        </div>

        <div className="input-group">
          <label>Access Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste Daraja access token"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" style={{ flex: 2 }} disabled={loading || parentLoading}>
            {loading || parentLoading ? 'Processing...' : `Submit ${amountKES.toLocaleString()} KES`}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            style={{ flex: 1 }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
