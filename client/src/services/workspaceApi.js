import api from './api';

export const workspaceApi = {
  // Get full workspace data
  getWorkspace: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/workspace`);
    return res.data;
  },

  // Task Operations
  createTask: async (projectId, taskData) => {
    const res = await api.post(`/projects/${projectId}/workspace/tasks`, taskData);
    return res.data;
  },

  updateTask: async (projectId, taskId, updateData) => {
    const res = await api.put(`/projects/${projectId}/workspace/tasks/${taskId}`, updateData);
    return res.data;
  },

  updateTaskStatus: async (projectId, taskId, status) => {
    const res = await api.patch(`/projects/${projectId}/workspace/tasks/${taskId}/status`, { status });
    return res.data;
  },

  deleteTask: async (projectId, taskId) => {
    const res = await api.delete(`/projects/${projectId}/workspace/tasks/${taskId}`);
    return res.data;
  },

  // Milestone Operations
  createMilestone: async (projectId, milestoneData) => {
    const res = await api.post(`/projects/${projectId}/workspace/milestones`, milestoneData);
    return res.data;
  },

  updateMilestone: async (projectId, milestoneId, updateData) => {
    const res = await api.put(`/projects/${projectId}/workspace/milestones/${milestoneId}`, updateData);
    return res.data;
  },

  deleteMilestone: async (projectId, milestoneId) => {
    const res = await api.delete(`/projects/${projectId}/workspace/milestones/${milestoneId}`);
    return res.data;
  },

  // Discussion Operations
  createDiscussion: async (projectId, discussionData) => {
    const res = await api.post(`/projects/${projectId}/workspace/discussions`, discussionData);
    return res.data;
  },

  replyDiscussion: async (projectId, discussionId, message) => {
    const res = await api.post(`/projects/${projectId}/workspace/discussions/${discussionId}/replies`, { message });
    return res.data;
  },

  deleteDiscussion: async (projectId, discussionId) => {
    const res = await api.delete(`/projects/${projectId}/workspace/discussions/${discussionId}`);
    return res.data;
  },

  // Resource Operations
  addResource: async (projectId, resourceData) => {
    const res = await api.post(`/projects/${projectId}/workspace/resources`, resourceData);
    return res.data;
  },

  deleteResource: async (projectId, resourceId) => {
    const res = await api.delete(`/projects/${projectId}/workspace/resources/${resourceId}`);
    return res.data;
  },

  // Project Settings & URLs
  updateWorkspaceSettings: async (projectId, settings) => {
    const res = await api.put(`/projects/${projectId}/workspace/settings`, settings);
    return res.data;
  },

  // Claim Skill Evidence on Completion
  claimSkillEvidence: async (projectId, payload) => {
    const res = await api.post(`/projects/${projectId}/workspace/claim-evidence`, payload);
    return res.data;
  },
};

export default workspaceApi;
