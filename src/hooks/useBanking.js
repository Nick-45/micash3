import { useState, useEffect, useCallback } from 'react';
import { bankingEngine } from '../services/bankingEngine';

export function useBanking(user) {
  const [balance, setBalance] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!user) return;
    const bal = await bankingEngine.getTreasuryBalance();
    const txns = await bankingEngine.getTransactions();
    const queue = await bankingEngine.getQueueSize();
    setBalance(bal);
    setTransactions(txns);
    setQueueSize(queue);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      bankingEngine.setUser(user);
      bankingEngine.on('onBalanceUpdate', setBalance);
      bankingEngine.on('onTransactionUpdate', setTransactions);
      bankingEngine.on('onQueueUpdate', setQueueSize);
      refreshData();
    }
  }, [user, refreshData]);

  const submitPayment = useCallback(async (paymentData) => {
    return await bankingEngine.submitPayment(paymentData);
  }, []);

  const resetData = useCallback(async () => {
    await bankingEngine.resetDemoData();
    await refreshData();
  }, [refreshData]);

  return {
    balance,
    queueSize,
    transactions,
    loading,
    submitPayment,
    resetData,
    refreshData
  };
}
