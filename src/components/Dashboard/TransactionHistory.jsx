import React from 'react';
import StatusBadge from '../Common/StatusBadge';

const TransactionHistory = ({ transactions, onReset }) => {

const formatCurrency = (amount, locale = 'en-KE') => {
return new Intl.NumberFormat(locale, {
style: 'currency',
currency: 'KES'
}).format(amount);
};

return (
<div className="glass-card" style={{ padding: '1.5rem' }}>
<h3 style={{ color: '#D4AF37', marginBottom: '1rem' }}>
Transaction Ledger </h3>

```
  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
    {transactions.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
        No transactions yet
      </div>
    ) : (
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Facility</th>
            <th>Account</th>
            <th>Amount (KES)</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.slice(0, 20).map((txn) => (
            <tr key={txn.id}>
              <td>
                <small>
                  {new Date(txn.date).toLocaleString()}
                </small>
              </td>

              <td>
                <small>{txn.facility?.name || 'N/A'}</small>
              </td>

              <td>
                <small>{txn.account}</small>
              </td>

              <td className="amount-positive">
                {formatCurrency(txn.amount)}
              </td>

              <td>
                <StatusBadge status={txn.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>

  <button
    onClick={onReset}
    className="btn-secondary"
    style={{ marginTop: '15px', width: '100%' }}
  >
    Reset All Data
  </button>
</div>
```

);
};

export default TransactionHistory;
