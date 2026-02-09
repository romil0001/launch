const API_BASE = '/api';

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || 'Request failed.';
    throw new Error(message);
  }
  return data;
}

export function login(payload) {
  return request('/auth/login', { method: 'POST', body: payload });
}

export function getMe(token) {
  return request('/me', { token });
}

export function getLeads(token) {
  return request('/leads', { token });
}

export function createLead(token, payload) {
  return request('/leads', { token, method: 'POST', body: payload });
}

export function updateLead(token, id, payload) {
  return request(`/leads/${id}`, { token, method: 'PATCH', body: payload });
}
