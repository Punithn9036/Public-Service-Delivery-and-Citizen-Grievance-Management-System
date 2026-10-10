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
  getProfile: () => request('/auth/me', { method: 'GET' }),
  verifyEmployee: (employeeId) => request('/auth/verify-employee', { method: 'POST', body: JSON.stringify({ employeeId }) }),
  getEligibleEmployees: () => request('/auth/eligible-employees', { method: 'GET' })
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
  reopen: (id, reason) => request(`/grievances/${id}/reopen`, { method: 'POST', body: JSON.stringify({ reason }) }),
  upvote: (id, citizenName) => request(`/grievances/${id}/upvote`, { method: 'POST', body: JSON.stringify({ citizenName }) }),
  getOfficerRoster: () => request('/grievances/officers/roster', { method: 'GET' })
};

export const applicationAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications?${query}`, { method: 'GET' });
  },
  getById: (id) => request(`/applications/${id}`, { method: 'GET' }),
  create: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, updateData) => request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(updateData) })
};

export const serviceAPI = {
  getAll: () => request('/services', { method: 'GET' }),
  getById: (id) => request(`/services/${id}`, { method: 'GET' })
};

export const ipfsAPI = {
  uploadFile: (fileOrPayload, filename = 'document') => {
    if (typeof File !== 'undefined' && fileOrPayload instanceof File) {
      const fd = new FormData();
      fd.append('file', fileOrPayload);
      return fetch(`${API_BASE_URL}/ipfs/upload`, {
        method: 'POST',
        body: fd
      }).then(res => res.json());
    }
    if (typeof FormData !== 'undefined' && fileOrPayload instanceof FormData) {
      return fetch(`${API_BASE_URL}/ipfs/upload`, {
        method: 'POST',
        body: fileOrPayload
      }).then(res => res.json());
    }
    const bodyObj = typeof fileOrPayload === 'string'
      ? { fileContent: fileOrPayload, filename }
      : fileOrPayload;
    return request('/ipfs/upload', {
      method: 'POST',
      body: JSON.stringify(bodyObj)
    });
  },
  getGatewayUrl: (cid) => `${API_BASE_URL}/ipfs/${cid}`,
  getMetadata: (cid) => request(`/ipfs/${cid}/meta`, { method: 'GET' })
};

export const notificationAPI = {
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications?${query}`, { method: 'GET' });
  },
  sendTest: (data) => request('/notifications/test', { method: 'POST', body: JSON.stringify(data) }),
  queryWhatsAppBot: (from, body) => request('/webhook/whatsapp', { method: 'POST', body: JSON.stringify({ from, body }) }),
  getWhatsAppStatus: () => request('/notifications/whatsapp-status', { method: 'GET' }),
  disconnectWhatsApp: () => request('/notifications/whatsapp-disconnect', { method: 'POST' })
};

export const blockchainAPI = {
  getInfo: () => request('/blockchain/info', { method: 'GET' }),
  getBlocks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/blockchain/blocks?${query}`, { method: 'GET' });
  },
  getBlockByNumber: (number) => request(`/blockchain/blocks/${number}`, { method: 'GET' }),
  getTransaction: (txId) => request(`/blockchain/transactions/${txId}`, { method: 'GET' }),
  getHistory: (grievanceId) => request(`/blockchain/history/${grievanceId}`, { method: 'GET' }),
  verifyTx: (txId) => request(`/blockchain/verify/${txId}`, { method: 'POST' })
};

export default {
  auth: authAPI,
  grievance: grievanceAPI,
  application: applicationAPI,
  service: serviceAPI,
  ipfs: ipfsAPI,
  notifications: notificationAPI,
  blockchain: blockchainAPI
};
