import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kslu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('kslu_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('kslu_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        // If /me fails, clear stale session
        setUser(null);
        setToken(null);
        localStorage.removeItem('kslu_user');
        localStorage.removeItem('kslu_token');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('kslu_user', JSON.stringify(userData));
      localStorage.setItem('kslu_token', jwtToken);
      return response;
    }
    return response;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('kslu_user', JSON.stringify(userData));
      localStorage.setItem('kslu_token', jwtToken);
      return response;
    }
    return response;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (ignored) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('kslu_user');
    localStorage.removeItem('kslu_token');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('kslu_user', JSON.stringify(updatedUser));
  };

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
