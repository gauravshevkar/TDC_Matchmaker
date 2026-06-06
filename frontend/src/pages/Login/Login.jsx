// pages/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      const data = await authService.seedUsers();
      toast.success('Demo accounts created! Use: matchmaker1 / TDC@2024');
      setForm({ username: 'matchmaker1', password: 'TDC@2024' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Seed failed';
      if (msg.includes('already')) {
        toast('Accounts already exist. Use: matchmaker1 / TDC@2024', { icon: 'ℹ️' });
        setForm({ username: 'matchmaker1', password: 'TDC@2024' });
      } else {
        toast.error(msg);
      }
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Ambient orbs */}
      <div className="login-orb orb-1" />
      <div className="login-orb orb-2" />
      <div className="login-orb orb-3" />

      <div className="login-container fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--rose-gold)"/>
            </svg>
          </div>
          <div>
            <h1 className="login-logo-title font-display">The Date Crew</h1>
            <p className="login-logo-sub">Matchmaker Dashboard</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card card">
          <div className="login-card-header">
            <h2 className="font-display">Welcome Back</h2>
            <p className="text-secondary text-sm">Sign in to your matchmaker account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="form-input input-with-icon"
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input input-with-icon input-with-icon-right"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <><span className="spinner" />&nbsp;Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-demo">
            <p className="text-sm text-muted" style={{ textAlign: 'center', marginBottom: 12 }}>
              First time? Create demo accounts to get started
            </p>
            <button
              className="btn btn-secondary w-full"
              onClick={handleSeed}
              disabled={seedLoading}
            >
              {seedLoading ? <><span className="spinner" />&nbsp;Creating...</> : '⚡ Create Demo Accounts'}
            </button>
          </div>

          <div className="login-creds">
            <div className="cred-item">
              <span className="cred-label">Matchmaker:</span>
              <code>matchmaker1 / TDC@2024</code>
            </div>
            
          </div>
        </div>

        <p className="login-footer text-muted text-xs text-center">
          © 2024 The Date Crew · Internal Tool · Confidential
        </p>
      </div>
    </div>
  );
}