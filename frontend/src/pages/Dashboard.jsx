import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import {
  Activity,
  CreditCard,
  Eye,
  EyeOff,
  History,
  PlusCircle,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([refreshUser(), fetchTransactions()]).finally(() => setLoading(false));
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions');
      setTransactions(res.data);
    } catch {
      // silently fail
    }
  };

  const now = new Date();
  const thisMonthTxs = transactions.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonthTxs.reduce(
    (sum, t) => (t.type === 'credit' ? sum + t.amount : sum - t.amount),
    0
  );
  const savingsGoal = Number(user?.savings_goal) || 0;
  const savedAmount = Number(user?.saved) || 0;
  const savingsProgress = savingsGoal > 0 ? Math.min((savedAmount / savingsGoal) * 100, 100) : 0;
  const monthlyDirection = thisMonthAmount >= 0 ? 'up' : 'down';
  const monthlyLabel = monthlyDirection === 'up' ? 'Positive flow' : 'Net outflow';
  const welcomeName = user?.full_name?.split(' ')[0] || user?.username || 'Investor';
  const isAdmin = user?.role === 'admin';
  const isActivated = user?.activation_status === 'active';

  const recentTx = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <section className="wallet-hero">
          <div className="wallet-hero-copy">
            <div className="wallet-hero-header">
              <div>
                <span className="wallet-hero-kicker">Digital asset wallet</span>
                <h2>Move faster with a cleaner view of your wallet.</h2>
                <p>
                  Available balance, monthly activity, and savings progress for {welcomeName} in one secure overview.
                </p>
              </div>
              <button
                className="wallet-balance-toggle"
                onClick={() => setShowBalance((value) => !value)}
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                {showBalance ? 'Hide balance' : 'Show balance'}
              </button>
            </div>

            <div className="wallet-balance-strip">
              <div>
                <p className="wallet-balance-label">Available balance</p>
                <div className="wallet-balance-value">
                  {showBalance ? formatCurrency(user?.balance) : '••••••••••'}
                </div>
              </div>
              <div className={`wallet-flow-pill ${monthlyDirection === 'up' ? 'is-up' : 'is-down'}`}>
                {monthlyDirection === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{monthlyLabel}</span>
                <strong>{formatCurrency(Math.abs(thisMonthAmount))}</strong>
              </div>
            </div>

            <div className="wallet-insights-grid">
              <div className="wallet-insight-card wallet-insight-card-accent">
                <div className="wallet-insight-icon">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="wallet-insight-label">Monthly volume</p>
                  <p className="wallet-insight-value">{thisMonthTxs.length} tx</p>
                  <p className="wallet-insight-sub">Live activity across your wallet this month</p>
                </div>
              </div>
              <div className="wallet-insight-card">
                <div className="wallet-insight-icon">
                  <Target size={18} />
                </div>
                <div>
                  <p className="wallet-insight-label">Savings target</p>
                  <p className="wallet-insight-value">{Math.round(savingsProgress)}%</p>
                  <p className="wallet-insight-sub">{formatCurrency(savedAmount)} of {formatCurrency(savingsGoal)}</p>
                </div>
              </div>
              <div className="wallet-insight-card">
                <div className="wallet-insight-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="wallet-insight-label">Wallet status</p>
                  <p className="wallet-insight-value">Secure</p>
                  <p className="wallet-insight-sub">{isAdmin ? 'Treasury controls enabled' : 'Protected account access'}</p>
                </div>
              </div>
            </div>

            <div className="action-row action-row-hero">
              <button
                className="btn-outline"
                onClick={() => navigate('/transactions')}
              >
                <History size={16} />
                Transaction History
              </button>
              <button
                className="btn-primary"
                onClick={() => isAdmin ? navigate('/admin') : alert('Please contact your administrator to add funds.')}
              >
                <PlusCircle size={16} />
                Add Funds
              </button>
            </div>
          </div>

          <div className="wallet-card-shell">
            <div className="wallet-card-orbit wallet-card-orbit-1" />
            <div className="wallet-card-orbit wallet-card-orbit-2" />
            <div className="credit-card credit-card-modern">
              <div className="credit-card-top">
                <div>
                  <span className="credit-card-label">QFS wallet</span>
                  <p className="credit-card-network">Multi-chain vault</p>
                </div>
                <div className="credit-card-chip">
                  <div className="chip-line" />
                  <div className="chip-line" />
                  <div className="chip-line" />
                </div>
              </div>

              <div className="credit-card-balance-wrap">
                <span className="credit-card-balance-label">Portfolio balance</span>
                <div className="credit-card-balance">
                  {showBalance ? formatCurrency(user?.balance) : '••••••••••'}
                </div>
              </div>

              <div className="credit-card-meta-grid">
                <div className="credit-card-meta-box">
                  <span>24h flow</span>
                  <strong className={thisMonthAmount >= 0 ? 'text-green' : 'text-red'}>
                    {thisMonthAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(thisMonthAmount))}
                  </strong>
                </div>
                <div className="credit-card-meta-box">
                  <span>Wallet tier</span>
                  <strong>{isAdmin ? 'Admin' : 'Premium'}</strong>
                </div>
              </div>

              <div className="credit-card-progress">
                <div className="credit-card-progress-copy">
                  <span>Savings goal</span>
                  <strong>{Math.round(savingsProgress)}%</strong>
                </div>
                <div className="credit-card-progress-bar">
                  <span style={{ width: `${savingsProgress}%` }} />
                </div>
              </div>

              <div className="credit-card-bottom">
                <div>
                  <span className="credit-card-number">{user?.card_number || '**** **** **** 0000'}</span>
                  <p className="credit-card-holder">{user?.full_name || user?.username || 'Wallet holder'}</p>
                </div>
                <div className="credit-card-expiry-wrap">
                  <span className="credit-card-expiry">Exp: {user?.card_expiry || 'N/A'}</span>
                  <span className={`credit-card-status ${isActivated ? 'is-active' : 'is-inactive'}`}>
                    <CreditCard size={14} />
                    {isActivated ? 'Active' : 'Not Activated'}
                  </span>
                </div>
              </div>

              <div className="cc-deco cc-deco-1" />
              <div className="cc-deco cc-deco-2" />
            </div>
          </div>
        </section>

        <div className="stats-row stats-row-modern">
          <div className="stat-card stat-card-modern">
            <p className="stat-label">This Month</p>
            <p className={`stat-value ${thisMonthAmount >= 0 ? 'text-green' : 'text-red'}`}>
              {formatCurrency(Math.abs(thisMonthAmount))}
            </p>
            <p className="stat-sub">
              {monthlyLabel} across {thisMonthTxs.length} transaction{thisMonthTxs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="stat-card stat-card-modern">
            <p className="stat-label">Transactions</p>
            <p className="stat-value text-purple">{transactions.length}</p>
            <p className="stat-sub">{thisMonthTxs.length} added during the current month</p>
          </div>
          <div className="stat-card stat-card-modern">
            <p className="stat-label">Saved</p>
            <p className="stat-value text-green">{formatCurrency(savedAmount)}</p>
            <p className="stat-sub">Goal: {formatCurrency(savingsGoal)}</p>
          </div>
        </div>

        <div className="card-details-box card-details-box-modern">
          <div className="card-details-header">
            <h3>Wallet Credentials</h3>
            <span className="badge-premium">{isAdmin ? 'Treasury Member' : 'Premium Member'}</span>
          </div>
          <div className="card-details-info">
            <div className="card-detail-icon">
              <div className="card-icon-dots">
                {[...Array(9)].map((_, i) => <span key={i} className="dot" />)}
              </div>
            </div>
            <div>
              <p className="card-detail-number">{user?.card_number || '**** **** **** 0000'}</p>
              <p className="card-detail-bank">QFS BANK · Encrypted settlement card</p>
            </div>
            <span className={isActivated ? 'badge-active' : 'badge-inactive'}>
              {isActivated ? 'Active' : 'Not Activated'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-side">
        <div className="recent-tx-panel">
          <div className="recent-tx-header">
            <h3>Recent Transactions</h3>
            <button className="link-btn" onClick={() => navigate('/transactions')}>
              View All
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="empty-state">No transactions yet.</div>
          ) : (
            <ul className="recent-tx-list">
              {recentTx.map((tx) => (
                <li key={tx.id} className="recent-tx-item">
                  <div
                    className={`tx-icon-wrap ${tx.type === 'credit' ? 'tx-credit' : 'tx-debit'}`}
                  >
                    {tx.type === 'credit' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div className="tx-info">
                    <p className="tx-desc">{tx.description || (tx.type === 'credit' ? 'Deposit' : 'Withdrawal')}</p>
                    <p className="tx-date">{formatDate(tx.created_at)}</p>
                  </div>
                  <span className={`tx-amount ${tx.type === 'credit' ? 'text-green' : 'text-red'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
