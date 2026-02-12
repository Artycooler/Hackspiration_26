import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="transactions-page">
      <h1>💳 Transactions</h1>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Blockchain Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>#{tx.id}</td>
                  <td>{tx.transaction_type}</td>
                  <td>${tx.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td>
                    {tx.blockchain_hash ? (
                      <code style={{ fontSize: '0.8rem' }}>
                        {tx.blockchain_hash.substring(0, 16)}...
                      </code>
                    ) : (
                      <span className="text-muted">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Transactions;
