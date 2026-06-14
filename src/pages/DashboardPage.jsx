import React from 'react';
import Header from '../components/Layout/Header';
import StatsGrid from '../components/Dashboard/StatsGrid';
import PaymentForm from '../components/Dashboard/PaymentForm';
import TransactionHistory from '../components/Dashboard/TransactionHistory';
import { useBanking } from '../hooks/useBanking';

const DashboardPage = ({ user, token, onLogout }) => {
  const { balance, queueSize, transactions, loading, submitPayment, resetData } = useBanking(user);

  return (
    <>
      <Header user={user} onLogout={onLogout} />
      
      <StatsGrid balance={balance} queueSize={queueSize} token={token} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginTop: '32px' }} className="two-columns">
        <PaymentForm onSubmit={submitPayment} loading={loading} />
        <TransactionHistory transactions={transactions} onReset={resetData} />
      </div>
    </>
  );
};

export default DashboardPage;
