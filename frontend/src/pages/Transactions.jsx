import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
}

function formatDateTime(str) {
  return new Date(str).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/transactions');
      setTransactions(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totalIn = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transaction History</h2>
          <p className="page-sub">All credits and debits on your account.</p>
        </div>
        <button className="icon-btn-soft" onClick={fetchTx} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="tx-summary-row">
        <div className="tx-summary-card tx-summary-credit">
          <TrendingUp size={20} />
          <div>
            <p className="tx-summary-label">Total In</p>
            <p className="tx-summary-value">{formatCurrency(totalIn)}</p>
          </div>
        </div>
        <div className="tx-summary-card tx-summary-debit">
          <TrendingDown size={20} />
          <div>
            <p className="tx-summary-label">Total Out</p>
            <p className="tx-summary-value">{formatCurrency(totalOut)}</p>
          </div>
        </div>
        <div className="tx-summary-card tx-summary-net">
          <div>
            <p className="tx-summary-label">Net Change</p>
            <p className={`tx-summary-value ${totalIn - totalOut >= 0 ? 'text-green' : 'text-red'}`}>
              {formatCurrency(totalIn - totalOut)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['all', 'credit', 'debit'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'credit' ? 'Credits' : 'Debits'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <div className="tx-list-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                {user?.role === 'admin' && <th>User</th>}
                <th>Description</th>
                <th>Amount</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className={`type-badge ${t.type === 'credit' ? 'type-credit' : 'type-debit'}`}>
                      {t.type === 'credit' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {t.type}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="text-muted">{t.full_name || t.username || '—'}</td>
                  )}
                  <td>{t.description || '—'}</td>
                  <td className={`fw-600 ${t.type === 'credit' ? 'text-green' : 'text-red'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="text-muted">{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
