import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api.js';
import { useAuth } from '../components/AuthProvider.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(formState);
      setToken(data.token);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
        <h1>Welcome back</h1>
        <p>Log in to access the CRM.</p>
        {error ? <div className="alert">{error}</div> : null}
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={formState.password}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
