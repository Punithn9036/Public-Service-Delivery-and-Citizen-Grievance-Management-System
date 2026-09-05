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
    const saved = localStorage.getItem('janseva_user');
    return saved ? JSON.parse(saved) : null;
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

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      // Try live backend API first
      const data = await authAPI.login({ email: cleanEmail, password });
      if (data && data.user) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data;
      }
    } catch (apiErr) {
      // If backend is offline or returned error, check demo and local fallback
      const demoUser = DEMO_USERS[cleanEmail];
      if (demoUser) {
        const dummyToken = `demo_jwt_token_${demoUser.role}_${Date.now()}`;
        setToken(dummyToken);
        setUser(demoUser);
        setLoading(false);
        return { token: dummyToken, user: demoUser };
      }
      
      // Fallback for custom registered local users
      const savedUsers = JSON.parse(localStorage.getItem('janseva_registered_users') || '[]');
      const localFound = savedUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (localFound) {
        const dummyToken = `demo_jwt_token_${localFound.role}_${Date.now()}`;
        setToken(dummyToken);
        setUser(localFound);
        setLoading(false);
        return { token: dummyToken, user: localFound };
      }

      setLoading(false);
      throw new Error(apiErr.response?.data?.message || apiErr.message || 'Invalid email or password.');
    }
  };

  const register = async (userData) => {
    setLoading(true);
    const cleanEmail = userData.email.toLowerCase().trim();

    try {
      const data = await authAPI.register(userData);
      if (data && data.user) {
        setToken(data.token);
        setUser(data.user);
        setLoading(false);
        return data;
      }
    } catch (apiErr) {
      // Offline fallback registration
      const newUserId = `USR-${userData.role.slice(0, 3)}-${Math.floor(100 + Math.random() * 899)}`;
      const newUser = {
        id: Date.now(),
        userId: newUserId,
        fullName: userData.fullName,
        email: cleanEmail,
        phone: userData.phone,
        role: userData.role,
        department: userData.role === 'CITIZEN' ? null : (userData.department || 'General Administration'),
        createdAt: new Date().toISOString()
      };

      const savedUsers = JSON.parse(localStorage.getItem('janseva_registered_users') || '[]');
      savedUsers.push(newUser);
      localStorage.setItem('janseva_registered_users', JSON.stringify(savedUsers));

      const dummyToken = `demo_jwt_token_${newUser.role}_${Date.now()}`;
      setToken(dummyToken);
      setUser(newUser);
      setLoading(false);
      return { token: dummyToken, user: newUser };
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
