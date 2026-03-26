import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__left">
        <div className="auth-art">
          <div className="auth-art__brand">
            <div className="auth-art__mark">P</div>
            <span className="auth-art__name">Pulse<span>HR</span></span>
          </div>
          <h1 className="auth-art__h">
            Manage your team
            <em>smarter.</em>
          </h1>
          <p className="auth-art__p">
            A modern HR platform to streamline employees, departments, and attendance — all in one place.
          </p>
          <div className="auth-art__pills">
            {['Employee Management', 'Attendance Tracking', 'Department Control', 'Real-time Analytics'].map((f) => (
              <div className="auth-art__pill" key={f}>
                <span className="auth-art__pill-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-page__right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2 className="auth-form__heading">Welcome back</h2>
          <p className="auth-form__sub">Sign in to your account to continue</p>

          {error && <div className="alert alert--error">⚠ {error}</div>}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
