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

off(event, callback) {
// simple cleanup support
if (this.callbacks[event] === callback) {
delete this.callbacks[event];
}
}

async getTreasuryBalance() {
if (!this.currentUser) return 0;

```
const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
return userDoc.exists()
  ? userDoc.data().treasuryBalance
  : 4651163;
```

}

async updateTreasuryBalance(newBalance) {
if (!this.currentUser) return;

```
await updateDoc(doc(db, 'users', this.currentUser.uid), {
  treasuryBalance: newBalance,
  lastUpdated: Timestamp.now()
});

this.callbacks.onBalanceUpdate?.(newBalance);
```

}

generateTransactionId() {
return "TXN_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// 🚨 REAL B2B CALL (Netlify Function)
async callB2BAPI(payload) {
const response = await fetch('/.netlify/functions/b2b', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(payload)
});

```
return await response.json();
```

}

async submitPayment(paymentRequest) {
if (!this.currentUser) {
return { success: false, error: "Not authenticated" };
}

```
const currentBalance = await this.getTreasuryBalance();

if (currentBalance < paymentRequest.amount) {
  return { success: false, error: "Insufficient treasury balance" };
}

// 🧾 Create transaction record FIRST
const transactionId = this.generateTransactionId();

const transaction = {
  id: transactionId,
  createdAt: Timestamp.now(),
  date: new Date().toISOString(),

  amount: paymentRequest.amount,
  amountKES: paymentRequest.amount * 129, // optional display

  recipient: paymentRequest.facility.name,
  account: paymentRequest.account,
  bank: paymentRequest.facility.bank,

  paybill: paymentRequest.paybill,
  status: TRANSACTION_STATUS.INITIATED,

  statusHistory: [
    {
      status: TRANSACTION_STATUS.INITIATED,
      timestamp: Timestamp.now(),
      message: "Transaction created"
    }
  ],

  description: paymentRequest.reference,
  userId: this.currentUser.uid,
  userEmail: this.currentUser.email,

  bankRef: null,
  failureReason: null
};

await setDoc(doc(db, 'transactions', transactionId), transaction);

this.callbacks.onTransactionUpdate?.(
  await this.getTransactions()
);

this.callbacks.onQueueUpdate?.(
  await this.getQueueSize()
);

// 🚀 CALL REAL SAFARICOM B2B VIA NETLIFY
const result = await this.callB2BAPI({
  transactionId,
  amount: paymentRequest.amount,
  paybill: paymentRequest.paybill,
  account: paymentRequest.account,
  token: paymentRequest.token
});

// 🧠 If API accepted request
if (result.success) {
  await updateDoc(doc(db, 'transactions', transactionId), {
    status: TRANSACTION_STATUS.PROCESSING,
    bankRef: result.data?.ConversationID || null,
    statusHistory: [
      ...transaction.statusHistory,
      {
        status: TRANSACTION_STATUS.PROCESSING,
        timestamp: Timestamp.now(),
        message: "Sent to Safaricom B2B"
      }
    ]
  });

  return {
    success: true,
    transactionId
  };
}

// ❌ Failed to send to API
await updateDoc(doc(db, 'transactions', transactionId), {
  status: TRANSACTION_STATUS.FAILED,
  failureReason: result.error || "API error",
  statusHistory: [
    ...transaction.statusHistory,
    {
      status: TRANSACTION_STATUS.FAILED,
      timestamp: Timestamp.now(),
      message: "Failed to send to Safaricom"
    }
  ]
});

return {
  success: false,
  error: result.error || "B2B request failed"
};
```

}

async getQueueSize() {
if (!this.currentUser) return 0;

```
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', this.currentUser.uid),
  where('status', 'in', [
    TRANSACTION_STATUS.INITIATED,
    TRANSACTION_STATUS.PROCESSING
  ])
);

const snapshot = await getDocs(q);
return snapshot.size;
```

}

async getTransactions() {
if (!this.currentUser) return [];

```
const q = query(
  collection(db, 'transactions'),
  where('userId', '==', this.currentUser.uid),
  orderBy('createdAt', 'desc'),
  limit(50)
);

const snapshot = await getDocs(q);

return snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

}

async resetDemoData() {
if (!this.currentUser) return;

```
await updateDoc(doc(db, 'users', this.currentUser.uid), {
  treasuryBalance: 4651163
});

const q = query(
  collection(db, 'transactions'),
  where('userId', '==', this.currentUser.uid)
);

const snapshot = await getDocs(q);

const batch = writeBatch(db);
snapshot.docs.forEach(d => batch.delete(d.ref));

await batch.commit();

this.callbacks.onTransactionUpdate?.([]);
this.callbacks.onQueueUpdate?.(0);
```

}
}

export const bankingEngine = new BankingEngine();
