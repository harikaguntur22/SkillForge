import api from './api';

export const getSkills = async (params = {}) => {
  return await api.get('/skills', { params });
};

export const createSkill = async (skillData) => {
  return await api.post('/skills', skillData);
};

export const getUserSkills = async () => {
  return await api.get('/user-skills');
};

export const addUserSkill = async (payload) => {
  return await api.post('/user-skills', payload);
};

export const updateUserSkill = async (id, updateData) => {
  return await api.put(`/user-skills/${id}`, updateData);
};

export const deleteUserSkill = async (id) => {
  return await api.delete(`/user-skills/${id}`);
};

export const addEvidence = async (userSkillId, evidenceData) => {
  return await api.post(`/user-skills/${userSkillId}/evidence`, evidenceData);
};

export const deleteEvidence = async (userSkillId, evidenceId) => {
  return await api.delete(`/user-skills/${userSkillId}/evidence/${evidenceId}`);
};

export const getPublicProfile = async (userId) => {
  return await api.get(`/users/${userId}`);
};
