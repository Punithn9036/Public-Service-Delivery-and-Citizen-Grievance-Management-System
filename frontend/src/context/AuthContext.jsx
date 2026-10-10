import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/apiClient';

const DEMO_USERS = {
  'aarav.sharma@example.com': {
    id: 1,
    userId: 'USR-CIT-001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    department: null,
    createdAt: new Date().toISOString()
  },
  'rajesh.varma@gov.in': {
    id: 2,
    userId: 'USR-OFF-012',
    fullName: 'Er. Rajesh Varma',
    email: 'rajesh.varma@gov.in',
    phone: '+91 94433 11223',
    role: 'OFFICER',
    department: 'Water Supply & Sanitation',
    createdAt: new Date().toISOString()
  },
  'admin.controlroom@gov.in': {
    id: 3,
    userId: 'USR-ADM-001',
    fullName: 'Smt. Kavitha Reddi',
    email: 'admin.controlroom@gov.in',
    phone: '+91 94411 99887',
    role: 'ADMIN',
    department: 'Municipal Governance',
    createdAt: new Date().toISOString()
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('janseva_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse user from storage:", e);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('janseva_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('janseva_token', token);
    } else {
      localStorage.removeItem('janseva_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('janseva_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('janseva_user');
    }
  }, [user]);

  const login = async (emailOrId, password, phoneOverride = null) => {
    setLoading(true);
    const identifier = (emailOrId || '').trim();

    try {
      // Try live backend API first
      const data = await authAPI.login({ email: identifier, password, phone: phoneOverride });
      if (data && data.user) {
        if (phoneOverride) {
          data.user.phone = phoneOverride;
        }
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data;
      }
    } catch (apiErr) {
      const lower = identifier.toLowerCase();
      // If backend is offline or returned error, check demo and local fallback
      const demoUser = DEMO_USERS[lower];
      if (demoUser) {
        const dummyToken = `demo_jwt_token_${demoUser.role}_${Date.now()}`;
        const activeUser = phoneOverride ? { ...demoUser, phone: phoneOverride } : demoUser;
        setToken(dummyToken);
        setUser(activeUser);
        setLoading(false);
        return { token: dummyToken, user: activeUser };
      }
      
      // Fallback for custom registered local users
      const savedUsers = JSON.parse(localStorage.getItem('janseva_registered_users') || '[]');
      const localFound = savedUsers.find(u => 
        u.email.toLowerCase() === lower || 
        (u.employeeId && u.employeeId.toUpperCase() === identifier.toUpperCase()) ||
        (u.phone && phoneOverride && u.phone.includes(phoneOverride))
      );
      if (localFound) {
        const activeUser = phoneOverride ? { ...localFound, phone: phoneOverride } : localFound;
        const dummyToken = `demo_jwt_token_${activeUser.role}_${Date.now()}`;
        setToken(dummyToken);
        setUser(activeUser);
        setLoading(false);
        return { token: dummyToken, user: activeUser };
      }

      setLoading(false);
      throw new Error(apiErr.response?.data?.message || apiErr.message || 'Invalid credentials.');
    }
  };

  const register = async (userData) => {
    setLoading(true);
    const cleanEmail = (userData.email || '').toLowerCase().trim();

    try {
      const data = await authAPI.register(userData);
      if (data && data.user) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data;
      }
    } catch (apiErr) {
      setLoading(false);
      throw apiErr;
    }
  };

  const quickDemoLogin = (role) => {
    let demoUser;
    if (role === 'CITIZEN') {
      demoUser = DEMO_USERS['aarav.sharma@example.com'];
    } else if (role === 'OFFICER') {
      demoUser = DEMO_USERS['rajesh.varma@gov.in'];
    } else if (role === 'ADMIN') {
      demoUser = DEMO_USERS['admin.controlroom@gov.in'];
    }

    if (demoUser) {
      const dummyToken = `demo_jwt_token_${demoUser.role}_${Date.now()}`;
      setToken(dummyToken);
      setUser(demoUser);
      return demoUser;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('janseva_token');
    localStorage.removeItem('janseva_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, quickDemoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
