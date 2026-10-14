// Centralized REST API Client for JanSeva / DIGIT CMS

const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    // Local development - any port (5173, 5174, 3000, 4173, etc.)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return 'http://localhost:5000/api';
    }

    // Served from same host on Render backend
    if (hostname.includes('onrender.com')) {
      return `${origin}/api`;
    }

    // Hosted on external frontend (Vercel, Netlify, GitHub Pages, etc.)
    // Route to live Render backend gateway
    return 'https://public-service-delivery-and-citizen.onrender.com/api';
  }

  return 'http://localhost:5000/api';
})();

/**
 * Helper to execute HTTP fetch requests with JWT Authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('janseva_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error('JanSeva backend server is warming up from standby. Please wait 15 seconds and try again.');
        }
        if (response.status === 404) {
          throw new Error(`API endpoint not found (HTTP 404: ${endpoint}).`);
        }
        const cleanSnippet = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
        throw new Error(cleanSnippet || `Server returned HTTP ${response.status}`);
      }
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API Request failed');
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
  uploadFile: async (fileOrPayload, filename = 'document') => {
    const handleResponse = async (res) => {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data;
      }
      const text = await res.text();
      throw new Error(text.replace(/<[^>]*>?/gm, ' ').trim().slice(0, 100) || `Upload failed with status ${res.status}`);
    };

    if (typeof File !== 'undefined' && fileOrPayload instanceof File) {
      const fd = new FormData();
      fd.append('file', fileOrPayload);
      const res = await fetch(`${API_BASE_URL}/ipfs/upload`, {
        method: 'POST',
        body: fd
      });
      return handleResponse(res);
    }
    if (typeof FormData !== 'undefined' && fileOrPayload instanceof FormData) {
      const res = await fetch(`${API_BASE_URL}/ipfs/upload`, {
        method: 'POST',
        body: fileOrPayload
      });
      return handleResponse(res);
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
