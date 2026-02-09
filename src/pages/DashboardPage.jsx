import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider.jsx';

const roleMenu = {
  Admin: ['Leads', 'Team', 'Settings'],
  Sales: ['Leads', 'Pipeline'],
  Service: ['Customers', 'Tickets'],
  Customer: ['My Requests'],
  StoreManager: ['Inventory', 'Suppliers'],
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const roles = user?.roles || [];
  const primaryRole = roles[0] || 'User';
  const menuItems = roleMenu[primaryRole] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Launch CRM</h2>
        <p>Signed in as {user.email}</p>
        <span className="tag">{primaryRole}</span>
        <nav style={{ marginTop: 16 }}>
          <Link to="/">Dashboard</Link>
          {(roles.includes('Admin') || roles.includes('Sales')) && (
            <Link to="/leads">Leads</Link>
          )}
        </nav>
        <button className="secondary" style={{ marginTop: 24 }} onClick={logout}>
          Log out
        </button>
      </aside>
      <main className="content">
        <div className="top-bar">
          <h1>Dashboard</h1>
        </div>
        <div className="card">
          <h3>Role-based navigation</h3>
          <p>
            This dashboard shows menu options based on your assigned role. Update
            roles in the database to see different experiences.
          </p>
          <ul>
            {menuItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
