import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('skillforge_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillforge_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state with current user profile from server on boot
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('skillforge_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('skillforge_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('skillforge_token');
          localStorage.removeItem('skillforge_user');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    verifyAuth();

    // Listen for unauthorized events emitted by Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    const { user: loggedInUser, token: receivedToken } = response.data;

    setUser(loggedInUser);
    setToken(receivedToken);
    localStorage.setItem('skillforge_token', receivedToken);
    localStorage.setItem('skillforge_user', JSON.stringify(loggedInUser));

    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authApi.register(userData);
    const { user: registeredUser, token: receivedToken } = response.data;

    setUser(registeredUser);
    setToken(receivedToken);
    localStorage.setItem('skillforge_token', receivedToken);
    localStorage.setItem('skillforge_user', JSON.stringify(registeredUser));

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if network request fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillforge_token');
      localStorage.removeItem('skillforge_user');
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('skillforge_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
