import { API_BASE } from '../config.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function uploadProject({ file, title, description }, token) {
  const formData = new FormData();
  formData.append('projectZip', file);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  return request('/projects/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export function listProjects() {
  return request('/projects/list');
}

export function getProjectById(id) {
  return request(`/projects/${id}`);
}

export function getProjectAnalysis(id) {
  return request(`/projects/${id}/analysis`);
}

export function getUserProjects(userId, token) {
  return request(`/projects/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getPendingReview(token) {
  return request('/projects/status/pending-review', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
