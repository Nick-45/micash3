import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import StatsGrid from '../components/Dashboard/StatsGrid';
import PaymentForm from '../components/Dashboard/PaymentForm';
import TransactionHistory from '../components/Dashboard/TransactionHistory';
import { useBanking } from '../hooks/useBanking';

const DashboardPage = ({ user, onLogout }) => {
  const [accessToken, setAccessToken] = useState(''); // State for access token
  
  const {
    balance,
    queueSize,
    transactions,
    loading,
    error,
    submitPayment,
    resetData
  } = useBanking(user);

  return (
    <>
      <Header 
        user={user} 
        onLogout={onLogout} 
        accessToken={accessToken} // ✅ Pass token to Header for balance queries
      />

      {/* Stats with token for timer */}
      <StatsGrid 
        balance={balance} 
        queueSize={queueSize} 
        token={accessToken} // ✅ Pass token to StatsGrid for timer
        onTokenExpiry={() => {
          // Optional: Handle token expiry
          console.log('Token has expired');
          // You could show a notification or clear the token
        }}
      />

      {/* Main Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '24px',
          marginTop: '32px'
        }}
        className="two-columns"
      >
        <PaymentForm
          onSubmit={submitPayment}
          loading={loading}
          onTokenChange={setAccessToken} // ✅ Pass token change handler
          token={accessToken} // ✅ Pass token to PaymentForm
        />

        <TransactionHistory
          transactions={transactions}
          onReset={resetData}
        />
      </div>

      {/* Global Error Display */}
      {error && (
        <div style={{ marginTop: '15px', color: 'red', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default DashboardPage;
