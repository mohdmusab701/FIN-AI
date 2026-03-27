import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('finai_token');
    const storedUser = localStorage.getItem('finai_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        getMe().then(res => {
          setUser(res.data);
          localStorage.setItem('finai_user', JSON.stringify(res.data));
        }).catch(() => {
          logout();
        });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('finai_token', token);
    localStorage.setItem('finai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('finai_token');
    localStorage.removeItem('finai_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('finai_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
