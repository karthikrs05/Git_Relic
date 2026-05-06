import { API_BASE } from '../config.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function submitPitch(projectId, data, token) {
  return request('/pitches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ projectId, ...data })
  });
}

export function getPitchesForProject(projectId) {
  return request(`/pitches/project/${projectId}`);
}

export function getUserPitches(token) {
  return request('/pitches/user/my', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function acceptPitch(pitchId, token) {
  return request(`/pitches/${pitchId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ decision: 'accepted' })
  });
}

export function rejectPitch(pitchId, token) {
  return request(`/pitches/${pitchId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ decision: 'rejected' })
  });
}
