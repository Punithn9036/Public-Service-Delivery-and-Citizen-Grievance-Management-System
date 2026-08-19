// Centralized REST API Client for JanSeva / DIGIT CMS

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to execute HTTP fetch requests with JWT Authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('janseva_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Request failed');
    }

    return data;
  } catch (err) {
    console.warn(`[API Client Warning] ${endpoint}:`, err.message);
    throw err;
  }
}

export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => request('/auth/me', { method: 'GET' })
};

export const grievanceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/grievances?${query}`, { method: 'GET' });
  },
  getById: (id) => request(`/grievances/${id}`, { method: 'GET' }),
  create: (data) => request('/grievances', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, updateData) => request(`/grievances/${id}/status`, { method: 'PATCH', body: JSON.stringify(updateData) }),
  submitFeedback: (id, feedback) => request(`/grievances/${id}/feedback`, { method: 'POST', body: JSON.stringify(feedback) }),
  reopen: (id, reason) => request(`/grievances/${id}/reopen`, { method: 'POST', body: JSON.stringify({ reason }) })
};

export default {
  auth: authAPI,
  grievance: grievanceAPI
};
