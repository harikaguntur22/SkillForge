import api from './api';

export const getMatches = async () => {
  return await api.get('/skill-exchange/matches');
};

export const sendRequest = async (payload) => {
  return await api.post('/skill-exchange/requests', payload);
};

export const getRequests = async () => {
  return await api.get('/skill-exchange/requests');
};

export const updateRequestStatus = async (id, status) => {
  return await api.put(`/skill-exchange/requests/${id}`, { status });
};

export const scheduleSession = async (sessionData) => {
  return await api.post('/sessions', sessionData);
};

export const getSessions = async () => {
  return await api.get('/sessions');
};

export const updateSessionStatus = async (id, status, notes) => {
  return await api.put(`/sessions/${id}`, { status, mentorNotes: notes });
};

export const submitFeedback = async (id, feedbackData) => {
  return await api.post(`/sessions/${id}/feedback`, feedbackData);
};
