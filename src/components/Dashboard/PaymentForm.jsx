import React, { useState, useEffect } from 'react';
import { MEDICAL_FACILITIES } from '../../constants';
import Alert from '../Common/Alert';

const PaymentForm = ({ onSubmit, loading: parentLoading }) => {
  const [selectedFacility, setSelectedFacility] = useState('');
  const [amount, setAmount] = useState(385000);
  const [reference, setReference] = useState('Monthly disbursement');
  const [paybill, setPaybill] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedFacilityData = 
    selectedFacility !== '' ? MEDICAL_FACILITIES[selectedFacility] : null;

  // ✅ Auto-update reference and paybill when facility changes
  useEffect(() => {
    if (selectedFacilityData) {
      // Use facility's account reference
      if (selectedFacilityData.account) {
        setReference(selectedFacilityData.account);
      }
      // Use facility's paybill number
      if (selectedFacilityData.paybill) {
        setPaybill(selectedFacilityData.paybill);
      }
    } else {
      // Reset to default when no facility selected
      setReference('Monthly disbursement');
      setPaybill('');
    }
  }, [selectedFacility]); // Runs when selectedFacility changes

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

    const result = await onSubmit({
      facility: selectedFacilityData,
      amount,
      reference, // ✅ Uses facility's account reference or manual entry
      paybill: paybill, // ✅ Uses facility's paybill number
      account: reference,
      token
    });

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Transaction queued (ID: ${result.transactionId})\nSent to Paybill ${paybill}\nAccount: ${reference}`
      });
      setAmount(385000);
      setSelectedFacility('');
      setReference('Monthly disbursement');
      setPaybill('');
    } else {
      setMessage({ type: 'error', text: `❌ ${result.error}` });
    }

    setLoading(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleReset = () => {
    setSelectedFacility('');
    setAmount(385000);
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
          <label>Amount (KES)</label>
          <input
            type="number"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
          />
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
            {loading || parentLoading ? 'Processing...' : 'Submit to Queue'}
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
