import { useState, useEffect, useCallback } from 'react';
import { bankingEngine } from '../services/bankingEngine';

export function useBanking(user) {
  const [balance, setBalance] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [bal, txns, queue] = await Promise.all([
        bankingEngine.getTreasuryBalance(),
        bankingEngine.getTransactions(),
        bankingEngine.getQueueSize()
      ]);

      setBalance(bal);
      setTransactions(txns);
      setQueueSize(queue);

    } catch (err) {
      setError(err.message || 'Failed to load banking data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    bankingEngine.setUser(user);

    const handleBalance = (data) => setBalance(data);
    const handleTransactions = (data) => setTransactions(data);
    const handleQueue = (data) => setQueueSize(data);

    bankingEngine.on('onBalanceUpdate', handleBalance);
    bankingEngine.on('onTransactionUpdate', handleTransactions);
    bankingEngine.on('onQueueUpdate', handleQueue);

    refreshData();

    // 🔥 CLEANUP (IMPORTANT FIX)
    return () => {
      bankingEngine.off('onBalanceUpdate', handleBalance);
      bankingEngine.off('onTransactionUpdate', handleTransactions);
      bankingEngine.off('onQueueUpdate', handleQueue);
    };
  }, [user, refreshData]);

  const submitPayment = useCallback(async (paymentData) => {
    try {
      setError(null);

      // Optional: basic validation layer
      if (!paymentData?.amount || !paymentData?.account) {
        throw new Error('Invalid payment data');
      }

      return await bankingEngine.submitPayment(paymentData);

    } catch (err) {
      setError(err.message || 'Payment failed');
      return { success: false, error: err.message };
    }
  }, []);

  const resetData = useCallback(async () => {
    try {
      setLoading(true);
      await bankingEngine.resetDemoData();
      await refreshData();
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  return {
    balance,
    queueSize,
    transactions,
    loading,
    error,
    submitPayment,
    resetData,
    refreshData
  };
}
