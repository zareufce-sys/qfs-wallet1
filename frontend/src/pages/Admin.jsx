import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserPlus, Edit2, Trash2, X, Check, DollarSign, RefreshCw } from 'lucide-react';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
}

function getApiErrorMessage(err, fallback) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.code === 'ERR_NETWORK') return 'Cannot reach the server. Make sure the backend is running on port 3001.';
  return fallback;
}

const EMPTY_FORM = {
  username: '',
  password: '',
  full_name: '',
  role: 'user',
  activation_status: 'inactive',
  balance: '',
  savings_goal: '10000',
  deposit_btc: '100',
  deposit_eth: '100',
  deposit_usdt: '100',
};

const EMPTY_BALANCE_FORM = { type: 'credit', amount: '', description: '' };

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit user modal
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Balance adjustment modal
  const [balanceUser, setBalanceUser] = useState(null);
  const [balanceForm, setBalanceForm] = useState(EMPTY_BALANCE_FORM);
  const [balanceError, setBalanceError] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Create user ────────────────────────────────────────────────────────────
  const handleCreateChange = (e) => {
    setCreateForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setCreateError('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await axios.post('/api/users', {
        ...createForm,
        balance: parseFloat(createForm.balance) || 0,
        savings_goal: parseFloat(createForm.savings_goal) || 10000,
        deposit_btc: parseFloat(createForm.deposit_btc) || 0,
        deposit_eth: parseFloat(createForm.deposit_eth) || 0,
        deposit_usdt: parseFloat(createForm.deposit_usdt) || 0,
      });
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'Failed to create user'));
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Edit user ──────────────────────────────────────────────────────────────
  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      full_name: u.full_name,
      role: u.role,
      activation_status: u.activation_status || 'inactive',
      card_number: u.card_number,
      card_expiry: u.card_expiry,
      savings_goal: String(u.savings_goal),
      deposit_btc: String(u.deposit_btc ?? 100),
      deposit_eth: String(u.deposit_eth ?? 100),
      deposit_usdt: String(u.deposit_usdt ?? 100),
      password: '',
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      const payload = {
        ...editForm,
        savings_goal: parseFloat(editForm.savings_goal) || 10000,
        deposit_btc: parseFloat(editForm.deposit_btc) || 0,
        deposit_eth: parseFloat(editForm.deposit_eth) || 0,
        deposit_usdt: parseFloat(editForm.deposit_usdt) || 0,
      };
      if (!payload.password) delete payload.password;
      await axios.put(`/api/users/${editUser.id}`, payload);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Failed to update user'));
    } finally {
      setEditLoading(false);
    }
  };

  // ── Balance adjustment ─────────────────────────────────────────────────────
  const openBalance = (u) => {
    setBalanceUser(u);
    setBalanceForm(EMPTY_BALANCE_FORM);
    setBalanceError('');
  };

  const handleBalanceChange = (e) => {
    setBalanceForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setBalanceError('');
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(balanceForm.amount);
    if (!amount || amount <= 0) {
      setBalanceError('Amount must be a positive number.');
      return;
    }
    setBalanceLoading(true);
    setBalanceError('');
    try {
      await axios.post('/api/transactions', {
        user_id: balanceUser.id,
        type: balanceForm.type,
        amount,
        description: balanceForm.description || (balanceForm.type === 'credit' ? 'Deposit' : 'Withdrawal'),
      });
      setBalanceUser(null);
      fetchUsers();
    } catch (err) {
      setBalanceError(getApiErrorMessage(err, 'Failed to adjust balance'));
    } finally {
      setBalanceLoading(false);
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete user'));
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Manage Users</h2>
          <p className="page-sub">Create accounts, adjust balances, and manage user access.</p>
        </div>
        <div className="page-header-actions">
          <button className="icon-btn-soft" onClick={fetchUsers} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="btn-primary" onClick={() => { setShowCreate(true); setCreateError(''); }}>
            <UserPlus size={16} />
            New Account
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Saved</th>
                <th>Card</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={7} className="table-empty">No users found.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{u.full_name.charAt(0).toUpperCase()}</div>
                      <span>{u.full_name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.username}</td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-green fw-600">{formatCurrency(u.balance)}</td>
                  <td className="text-muted">{formatCurrency(u.saved)}</td>
                  <td className="text-muted font-mono">{u.card_number}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn text-green"
                        title="Adjust Balance"
                        onClick={() => openBalance(u)}
                      >
                        <DollarSign size={15} />
                      </button>
                      <button
                        className="table-action-btn text-purple"
                        title="Edit"
                        onClick={() => openEdit(u)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="table-action-btn text-red"
                        title="Delete"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.username === 'admin'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Account</h3>
              <button className="icon-btn" onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="full_name" value={createForm.full_name} onChange={handleCreateChange} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input name="username" value={createForm.username} onChange={handleCreateChange} placeholder="johndoe" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password * (min 6 chars)</label>
                  <input name="password" type="password" value={createForm.password} onChange={handleCreateChange} placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={createForm.role} onChange={handleCreateChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Activation Status</label>
                  <select name="activation_status" value={createForm.activation_status} onChange={handleCreateChange}>
                    <option value="inactive">Not Activated</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="form-group" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Starting Balance ($)</label>
                  <input name="balance" type="number" min="0" step="0.01" value={createForm.balance} onChange={handleCreateChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Savings Goal ($)</label>
                  <input name="savings_goal" type="number" min="0" step="0.01" value={createForm.savings_goal} onChange={handleCreateChange} placeholder="10000" />
                </div>
              </div>
              <div className="form-section-title">QR Deposit Amounts</div>
              <div className="form-row">
                <div className="form-group">
                  <label>BTC Amount (USD)</label>
                  <input name="deposit_btc" type="number" min="0" step="0.01" value={createForm.deposit_btc} onChange={handleCreateChange} placeholder="100" />
                </div>
                <div className="form-group">
                  <label>ETH Amount (USD)</label>
                  <input name="deposit_eth" type="number" min="0" step="0.01" value={createForm.deposit_eth} onChange={handleCreateChange} placeholder="100" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>USDT Amount (USD)</label>
                  <input name="deposit_usdt" type="number" min="0" step="0.01" value={createForm.deposit_usdt} onChange={handleCreateChange} placeholder="100" />
                </div>
                <div className="form-group" />
              </div>
              {createError && <div className="form-error">{createError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createLoading}>
                  {createLoading ? <span className="spinner-sm" /> : <><Check size={15} /> Create Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit — {editUser.full_name}</h3>
              <button className="icon-btn" onClick={() => setEditUser(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="full_name" value={editForm.full_name} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={editForm.role} onChange={handleEditChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Activation Status</label>
                  <select name="activation_status" value={editForm.activation_status} onChange={handleEditChange}>
                    <option value="inactive">Not Activated</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="form-group" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Card Number</label>
                  <input name="card_number" value={editForm.card_number} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Card Expiry</label>
                  <input name="card_expiry" value={editForm.card_expiry} onChange={handleEditChange} placeholder="MM/YYYY" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Savings Goal ($)</label>
                  <input name="savings_goal" type="number" min="0" step="0.01" value={editForm.savings_goal} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep)</label>
                  <input name="password" type="password" value={editForm.password} onChange={handleEditChange} placeholder="••••••••" />
                </div>
              </div>
              <div className="form-section-title">QR Deposit Amounts</div>
              <div className="form-row">
                <div className="form-group">
                  <label>BTC Amount (USD)</label>
                  <input name="deposit_btc" type="number" min="0" step="0.01" value={editForm.deposit_btc} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>ETH Amount (USD)</label>
                  <input name="deposit_eth" type="number" min="0" step="0.01" value={editForm.deposit_eth} onChange={handleEditChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>USDT Amount (USD)</label>
                  <input name="deposit_usdt" type="number" min="0" step="0.01" value={editForm.deposit_usdt} onChange={handleEditChange} />
                </div>
                <div className="form-group" />
              </div>
              {editError && <div className="form-error">{editError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? <span className="spinner-sm" /> : <><Check size={15} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Balance Adjustment Modal ── */}
      {balanceUser && (
        <div className="modal-overlay" onClick={() => setBalanceUser(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Balance — {balanceUser.full_name}</h3>
              <button className="icon-btn" onClick={() => setBalanceUser(null)}><X size={18} /></button>
            </div>
            <div className="current-balance-info">
              Current balance: <strong>{formatCurrency(balanceUser.balance)}</strong>
            </div>
            <form onSubmit={handleBalanceSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={balanceForm.type} onChange={handleBalanceChange}>
                    <option value="credit">Add Funds (Credit)</option>
                    <option value="debit">Remove Funds (Debit)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ($) *</label>
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={balanceForm.amount}
                    onChange={handleBalanceChange}
                    placeholder="0.00"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input name="description" value={balanceForm.description} onChange={handleBalanceChange} placeholder="e.g. Monthly deposit" />
              </div>
              {balanceError && <div className="form-error">{balanceError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setBalanceUser(null)}>Cancel</button>
                <button
                  type="submit"
                  className={`btn-primary ${balanceForm.type === 'debit' ? 'btn-danger' : ''}`}
                  disabled={balanceLoading}
                >
                  {balanceLoading ? <span className="spinner-sm" /> : (
                    balanceForm.type === 'credit' ? '+ Add Funds' : '− Remove Funds'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button className="icon-btn" onClick={() => setDeleteTarget(null)}><X size={18} /></button>
            </div>
            <p className="modal-confirm-text">
              Are you sure you want to delete <strong>{deleteTarget.full_name}</strong> ({deleteTarget.username})?
              This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-primary btn-danger" onClick={handleDelete}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
