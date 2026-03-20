import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Save, CheckCircle } from 'lucide-react';

export default function Account() {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (form.new_password && form.new_password !== form.confirm_password) {
      setError('New passwords do not match.');
      return;
    }
    if (form.new_password && form.new_password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = { full_name: form.full_name };
      if (form.new_password) payload.password = form.new_password;
      await axios.put(`/api/users/${user.id}`, payload);
      await refreshUser();
      setSuccess('Account updated successfully.');
      setForm((f) => ({ ...f, new_password: '', confirm_password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Account</h2>
          <p className="page-sub">
            {isAdmin
              ? 'As admin, you can update your own name and password here.'
              : 'Your profile name and password are managed by your administrator.'}
          </p>
        </div>
      </div>

      <div className="account-layout">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
          <h3 className="profile-name">{user?.full_name}</h3>
          <p className="profile-username">@{user?.username}</p>
          <span className={`role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
            {user?.role}
          </span>
          <div className="profile-card-info">
            <div className="profile-info-row">
              <span>Card</span>
              <span>{user?.card_number}</span>
            </div>
            <div className="profile-info-row">
              <span>Expires</span>
              <span>{user?.card_expiry}</span>
            </div>
            <div className="profile-info-row">
              <span>Member since</span>
              <span>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile settings */}
        <div className="account-form-card">
          <h3 className="form-card-title">Profile Settings</h3>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="full_name"
                value={isAdmin ? form.full_name : (user?.full_name || '')}
                onChange={isAdmin ? handleChange : undefined}
                readOnly={!isAdmin}
                disabled={!isAdmin}
              />
            </div>

            <hr className="form-divider" />
            <p className="form-section-title">Password</p>

            <div className="form-row">
              <div className="form-group">
                <label>{isAdmin ? 'New Password' : 'Password Status'}</label>
                <input
                  name="new_password"
                  type={isAdmin ? 'password' : 'text'}
                  value={isAdmin ? form.new_password : 'Protected'}
                  onChange={isAdmin ? handleChange : undefined}
                  placeholder={isAdmin ? 'Leave blank to keep current' : undefined}
                  readOnly={!isAdmin}
                  disabled={!isAdmin}
                />
              </div>
              <div className="form-group">
                <label>{isAdmin ? 'Confirm New Password' : 'Change Request'}</label>
                <input
                  name="confirm_password"
                  type={isAdmin ? 'password' : 'text'}
                  value={isAdmin ? form.confirm_password : 'Contact administrator'}
                  onChange={isAdmin ? handleChange : undefined}
                  placeholder={isAdmin ? 'Repeat new password' : undefined}
                  readOnly={!isAdmin}
                  disabled={!isAdmin}
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && (
              <div className="form-success">
                <CheckCircle size={15} /> {success}
              </div>
            )}

            {isAdmin ? (
              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="spinner-sm" /> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            ) : (
              <div className="form-success">
                Name and password changes are disabled for all users.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
