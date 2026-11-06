import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vedhika_user') || 'null'); } catch { return null; }
  });
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vedhika_admin') || 'null'); } catch { return null; }
  });

  const saveSession = (data, role) => {
    localStorage.setItem('vedhika_token', data.token);
    if (data.refresh) localStorage.setItem('vedhika_refresh', data.refresh);
    if (role === 'admin') {
      localStorage.setItem('vedhika_role', 'admin');
      localStorage.setItem('vedhika_admin', JSON.stringify(data.user));
      localStorage.removeItem('vedhika_user');
      setAdmin(data.user);
      setUser(null);
    } else {
      localStorage.setItem('vedhika_role', 'customer');
      localStorage.setItem('vedhika_user', JSON.stringify(data.user));
      localStorage.removeItem('vedhika_admin');
      setUser(data.user);
      setAdmin(null);
    }
  };

  const register = async (values) => saveSession((await api.post('/auth/register', values)).data, 'customer');
  const login = async (values) => saveSession((await api.post('/auth/login', values)).data, 'customer');
  const adminLogin = async (values) => saveSession((await api.post('/auth/admin/login', values)).data, 'admin');
  const updateUser = (nextUser) => {
    localStorage.setItem('vedhika_user', JSON.stringify(nextUser));
    setUser(nextUser);
  };
  const logout = () => {
    localStorage.removeItem('vedhika_token');
    localStorage.removeItem('vedhika_refresh');
    localStorage.removeItem('vedhika_role');
    localStorage.removeItem('vedhika_user');
    localStorage.removeItem('vedhika_admin');
    setUser(null);
    setAdmin(null);
  };

  const value = useMemo(() => ({ user, admin, register, login, adminLogin, updateUser, logout }), [user, admin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
