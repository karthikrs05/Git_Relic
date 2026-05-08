import { API_BASE } from '../config.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function getMyInsights(token) {
  return request('/insights/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

