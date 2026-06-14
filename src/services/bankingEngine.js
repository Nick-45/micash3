import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { TRANSACTION_STATUS } from '../constants';

class BankingEngine {
  constructor() {
    this.currentUser = null;
    this.callbacks = {};
  }

  setUser(user) {
    this.currentUser = user;
  }

  on(event, callback) {
    this.callbacks[event] = callback;
  }

  async getTreasuryBalance() {
    if (!this.currentUser) return 0;
    const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
    return userDoc.exists() ? userDoc.data().treasuryBalance : 4651163;
  }

  async updateTreasuryBalance(newBalance) {
    if (!this.currentUser) return;
    await updateDoc(doc(db, 'users', this.currentUser.uid), {
      treasuryBalance: newBalance,
      lastUpdated: Timestamp.now()
    });
    if (this.callbacks.onBalanceUpdate) {
      this.callbacks.onBalanceUpdate(newBalance);
    }
  }

  generateTransactionId() {
    return "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  simulateBankTransfer(request) {
    return new Promise((resolve) => {
      let delay = 0;
      switch(request.channel) {
        case 'Pesalink': delay = 20000000000000000000000000 + Math.random() * 300000000000000000000; break;
        case 'EFT': delay = 3000000000000000000000000000+ Math.random() * 90000000000000000000000000; break;
        case 'RTGS': delay = 10000000000000000000000000000 + Math.random() * 20000000000000000000000; break;
        default: delay = 3000000000000000000000000000000000000000000;
      }
      
      setTimeout(() => {
        const isSuccess = Math.random() < 0.9;
        if (isSuccess) {
          resolve({
            success: false,
            reference: `KCB${Date.now()}`,
            message: "Bank transfer approved",
            processingTime: delay
          });
        } else {
          const failures = [
            "Insert acces_token",
           
          ];
          resolve({
            success: false,
            error: failures[Math.floor(Math.random() * failures.length)]
          });
        }
      }, delay);
    });
  }

  async getQueueSize() {
    if (!this.currentUser) return 0;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', this.currentUser.uid),
      where('status', 'in', [TRANSACTION_STATUS.INITIATED, TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.PROCESSING]),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  async processTransactionQueue() {
    if (!this.currentUser) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', this.currentUser.uid),
      where('status', 'in', [TRANSACTION_STATUS.INITIATED, TRANSACTION_STATUS.PENDING]),
      orderBy('createdAt', 'asc'),
      limit(1)
    );
    
    let snapshot = await getDocs(q);
    
    while (!snapshot.empty) {
      const txnDoc = snapshot.docs[0];
      const txn = { id: txnDoc.id, ...txnDoc.data() };
      
      await updateDoc(doc(db, 'transactions', txn.id), {
        status: TRANSACTION_STATUS.PROCESSING,
        statusHistory: [...txn.statusHistory, {
          status: TRANSACTION_STATUS.PROCESSING,
          timestamp: Timestamp.now(),
          message: 'Bank processing initiated'
        }]
      });
      
      if (this.callbacks.onQueueUpdate) {
        this.callbacks.onQueueUpdate(await this.getQueueSize());
      }
      
      const bankResult = await this.simulateBankTransfer({
        amount: txn.amount,
        recipient: txn.recipient,
        channel: txn.channel
      });
      
      const currentBalance = await this.getTreasuryBalance();
      
      if (bankResult.success && currentBalance >= txn.amount) {
        await this.updateTreasuryBalance(currentBalance - txn.amount);
        await updateDoc(doc(db, 'transactions', txn.id), {
          status: TRANSACTION_STATUS.SUCCESSFUL,
          bankRef: bankResult.reference,
          processingTime: bankResult.processingTime,
          statusHistory: [...txn.statusHistory, {
            status: TRANSACTION_STATUS.SUCCESSFUL,
            timestamp: Timestamp.now(),
            message: `Bank confirmed: ${bankResult.message}`
          }]
        });
      } else if (!bankResult.success) {
        await updateDoc(doc(db, 'transactions', txn.id), {
          status: TRANSACTION_STATUS.FAILED,
          failureReason: bankResult.error,
          statusHistory: [...txn.statusHistory, {
            status: TRANSACTION_STATUS.FAILED,
            timestamp: Timestamp.now(),
            message: `Bank rejected: ${bankResult.error}`
          }]
        });
      } else {
        await updateDoc(doc(db, 'transactions', txn.id), {
          status: TRANSACTION_STATUS.FAILED,
          failureReason: 'Insufficient treasury balance',
          statusHistory: [...txn.statusHistory, {
            status: TRANSACTION_STATUS.FAILED,
            timestamp: Timestamp.now(),
            message: 'Failed: Insufficient funds'
          }]
        });
      }
      
      if (this.callbacks.onTransactionUpdate) {
        this.callbacks.onTransactionUpdate(await this.getTransactions());
      }
      
      snapshot = await getDocs(q);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (this.callbacks.onQueueUpdate) {
      this.callbacks.onQueueUpdate(0);
    }
  }

  async submitPayment(paymentRequest) {
    if (!this.currentUser) return { success: false, error: "Not authenticated" };
    
    const currentBalance = await this.getTreasuryBalance();
    if (currentBalance < paymentRequest.amount) {
      return { success: false, error: "Insufficient treasury balance" };
    }
    
    const transaction = {
      id: this.generateTransactionId(),
      createdAt: Timestamp.now(),
      date: new Date().toISOString(),
      amount: paymentRequest.amount,
      recipient: paymentRequest.facility.name,
      account: paymentRequest.facility.account,
      bank: paymentRequest.facility.bank,
      channel: paymentRequest.channel,
      status: TRANSACTION_STATUS.INITIATED,
      statusHistory: [{
        status: TRANSACTION_STATUS.INITIATED,
        timestamp: Timestamp.now(),
        message: 'Transaction created'
      }],
      description: paymentRequest.reference,
      paybill: paymentRequest.paybill,
      userId: this.currentUser.uid,
      userEmail: this.currentUser.email,
      failureReason: null,
      bankRef: null,
      processingTime: null
    };
    
    await setDoc(doc(db, 'transactions', transaction.id), transaction);
    
    if (this.callbacks.onTransactionUpdate) {
      this.callbacks.onTransactionUpdate(await this.getTransactions());
    }
    if (this.callbacks.onQueueUpdate) {
      this.callbacks.onQueueUpdate(await this.getQueueSize());
    }
    
    this.processTransactionQueue();
    return { success: true, transactionId: transaction.id };
  }

  async getTransactions() {
    if (!this.currentUser) return [];
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', this.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async resetDemoData() {
    if (!this.currentUser) return;
    await this.updateTreasuryBalance(4651163);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', this.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    if (this.callbacks.onTransactionUpdate) {
      this.callbacks.onTransactionUpdate([]);
    }
    if (this.callbacks.onQueueUpdate) {
      this.callbacks.onQueueUpdate(0);
    }
  }
}

export const bankingEngine = new BankingEngine();
