import api from './api';

export const getRecommendedCollaborators = async (projectId, params = {}) => {
  return await api.get(`/projects/${projectId}/collaborators/recommended`, { params });
};

export const inviteCollaborator = async (projectId, data) => {
  return await api.post(`/projects/${projectId}/collaborators/invite`, data);
};

export const requestToJoinProject = async (projectId, data) => {
  return await api.post(`/projects/${projectId}/collaborators/join`, data);
};

export const getProjectCollaborationRequests = async (projectId) => {
  return await api.get(`/projects/${projectId}/collaborators/requests`);
};

export const getMyCollaborationRequests = async (params = {}) => {
  return await api.get('/collaborations/my-requests', { params });
};

export const respondToCollaborationRequest = async (requestId, data) => {
  return await api.put(`/collaborations/${requestId}/respond`, data);
};

export const cancelCollaborationRequest = async (requestId) => {
  return await api.put(`/collaborations/${requestId}/cancel`);
};

export const getProjectMembers = async (projectId) => {
  return await api.get(`/projects/${projectId}/members`);
};

export const updateProjectMemberRole = async (projectId, userId, role) => {
  return await api.put(`/projects/${projectId}/members/${userId}/role`, { role });
};

export const removeProjectMember = async (projectId, userId) => {
  return await api.delete(`/projects/${projectId}/members/${userId}`);
};

export const leaveProject = async (projectId) => {
  return await api.post(`/projects/${projectId}/leave`);
};
