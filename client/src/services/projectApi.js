import api from './api';

export const getProjects = async (params = {}) => {
  return await api.get('/projects', { params });
};

export const getRecommendedProjects = async (params = {}) => {
  return await api.get('/projects/recommended', { params });
};

export const getProjectById = async (id) => {
  return await api.get(`/projects/${id}`);
};

export const createProject = async (projectData) => {
  return await api.post('/projects', projectData);
};

export const updateProject = async (id, projectData) => {
  return await api.put(`/projects/${id}`, projectData);
};

export const deleteProject = async (id) => {
  return await api.delete(`/projects/${id}`);
};
