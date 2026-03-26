import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            Set up your
            <em>workspace.</em>
          </h1>
          <p className="auth-art__p">
            Create your admin account and start managing your organisation with PulseHR's powerful tools.
          </p>
          <div className="auth-art__pills">
            {['Quick Setup', 'Secure & Encrypted', 'Full Admin Control', 'Zero Config'].map((f) => (
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
          <h2 className="auth-form__heading">Create account</h2>
          <p className="auth-form__sub">Fill in your details to get started</p>

          {error && <div className="alert alert--error">⚠ {error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input placeholder="John" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
