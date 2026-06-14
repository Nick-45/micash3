import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { MOCK_TRANSACTIONS, PAYBILL_NUMBER } from '../constants';

export async function loadMockDataForUser(userId, userEmail) {
  // Check if user already has transactions
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    const batch = writeBatch(db);
    
    MOCK_TRANSACTIONS.forEach((mockTxn, index) => {
      const txnId = `MOCK_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
      const transaction = {
        id: txnId,
        createdAt: Timestamp.fromDate(new Date(mockTxn.date)),
        date: mockTxn.date,
        amount: mockTxn.amount,
        recipient: mockTxn.recipient,
        account: mockTxn.account,
        bank: mockTxn.bank,
        channel: mockTxn.channel,
        status: mockTxn.status,
        statusHistory: [{
          status: mockTxn.status,
          timestamp: Timestamp.fromDate(new Date(mockTxn.date)),
          message: 'Transaction completed successfully'
        }],
        description: mockTxn.description,
        paybill: PAYBILL_NUMBER,
        userId: userId,
        userEmail: userEmail,
        failureReason: null,
        bankRef: `KCB_MOCK_${Date.now()}`,
        processingTime: 5000
      };
      batch.set(doc(db, 'transactions', txnId), transaction);
    });
    
    await batch.commit();
    return true;
  }
  return false;
}

export async function getUserCount() {
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);
  return snapshot.size;
}
