import api from './api';

export const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const login = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const logout = async () => {
  try {
    return await api.post('/auth/logout');
  } catch {
    // Stateless logout can fail gracefully
    return { success: true };
  }
};

export const getMe = async () => {
  return await api.get('/auth/me');
};

export const updateProfile = async (profileData) => {
  return await api.put('/auth/profile', profileData);
};

export const checkHealth = async () => {
  return await api.get('/health');
};
