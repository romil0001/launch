import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead, getLeads, updateLead } from '../api.js';
import { useAuth } from '../components/AuthProvider.jsx';

const statusOptions = [
  'New',
  'Contacted',
  'Follow-Up',
  'Quotation Sent',
  'Converted',
  'Lost',
];

export default function LeadsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    notes: '',
  });

  useEffect(() => {
    if (!user) return;
    if (!(user.roles || []).some((role) => role === 'Admin' || role === 'Sales')) {
      navigate('/');
      return;
    }

    async function loadLeads() {
      setLoading(true);
      setError('');
      try {
        const data = await getLeads(token);
        setLeads(data.leads);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [token, user, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await createLead(token, formState);
      setLeads((prev) => [data.lead, ...prev]);
      setFormState({ name: '', email: '', phone: '', status: 'New', notes: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const onStatusChange = async (leadId, status) => {
    try {
      const data = await updateLead(token, leadId, { status });
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? data.lead : lead))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Launch CRM</h2>
        <p>Signed in as {user?.email}</p>
        <nav style={{ marginTop: 16 }}>
          <a href="/">Dashboard</a>
          <a href="/leads">Leads</a>
        </nav>
      </aside>
      <main className="content">
        <div className="top-bar">
          <h1>Leads</h1>
        </div>
        {error ? <div className="alert">{error}</div> : null}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Create lead</h3>
          <form className="form-grid" onSubmit={onSubmit}>
            <label>
              Name
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
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
              Phone
              <input
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </label>
            <label>
              Status
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <textarea
                rows="3"
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, notes: event.target.value }))
                }
              />
            </label>
            <button type="submit">Create lead</button>
          </form>
        </div>
        <div className="card">
          <h3>Recent leads</h3>
          {loading ? (
            <p>Loading leads...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(event) =>
                          onStatusChange(lead.id, event.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{lead.owner_email || 'Unassigned'}</td>
                    <td>{new Date(lead.updated_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
