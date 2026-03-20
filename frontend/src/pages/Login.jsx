import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 3001.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left decorative panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">
            <img src="/qfs-logo.svg" alt="QFS logo" className="brand-logo" />
          </div>
          <span className="brand-name">QFS Account</span>
        </div>
        <h1 className="login-tagline">Secure Digital Wallet Management</h1>
        <p className="login-sub">Manage your finances, track transactions, and control balances — all in one place.</p>
        <div className="login-decorations">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
        </div>
      </div>

      {/* Right login form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? <span className="spinner-sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="login-hint">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
