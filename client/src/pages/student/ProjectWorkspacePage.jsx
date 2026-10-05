import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import workspaceApi from '../../services/workspaceApi';
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader';
import KanbanBoard from '../../components/workspace/KanbanBoard';
import TaskModal from '../../components/workspace/TaskModal';
import MilestonesSection from '../../components/workspace/MilestonesSection';
import DiscussionsSection from '../../components/workspace/DiscussionsSection';
import ResourcesSection from '../../components/workspace/ResourcesSection';
import WorkspaceSettingsModal from '../../components/workspace/WorkspaceSettingsModal';
import ClaimEvidenceModal from '../../components/workspace/ClaimEvidenceModal';
import TeamManagementSection from '../../components/collaboration/TeamManagementSection';
import {
  LayoutDashboard,
  Layers,
  MessageSquare,
  FolderGit2,
  Users,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const ProjectWorkspacePage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState('TODO');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.getWorkspace(projectId);
      setWorkspace(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load project workspace. Make sure you are an active collaborator or project creator.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWorkspace();
    }
  }, [projectId]);

  // Task Handlers
  const handleOpenNewTask = (status = 'TODO') => {
    setEditingTask(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        await workspaceApi.updateTask(projectId, editingTask._id, taskData);
      } else {
        await workspaceApi.createTask(projectId, taskData);
      }
      await fetchWorkspace();
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      // Optimistic update
      setWorkspace((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((t) =>
          t._id === taskId ? { ...t, status: nextStatus } : t
        );
        const total = updatedTasks.length;
        const completed = updatedTasks.filter((t) => t.status === 'DONE').length;
        return {
          ...prev,
          tasks: updatedTasks,
          progress: {
            ...prev.progress,
            completedTasks: completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          },
        };
      });

      await workspaceApi.updateTaskStatus(projectId, taskId, nextStatus);
      await fetchWorkspace();
    } catch (err) {
      await fetchWorkspace();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await workspaceApi.deleteTask(projectId, taskId);
      await fetchWorkspace();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Milestone Handlers
  const handleCreateMilestone = async (data) => {
    await workspaceApi.createMilestone(projectId, data);
    await fetchWorkspace();
  };

  const handleUpdateMilestone = async (milestoneId, data) => {
    await workspaceApi.updateMilestone(projectId, milestoneId, data);
    await fetchWorkspace();
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone? Associated tasks will be detached.')) return;
    await workspaceApi.deleteMilestone(projectId, milestoneId);
    await fetchWorkspace();
  };

  // Discussion Handlers
  const handleCreateDiscussion = async (data) => {
    await workspaceApi.createDiscussion(projectId, data);
    await fetchWorkspace();
  };

  const handleReplyDiscussion = async (discussionId, message) => {
    await workspaceApi.replyDiscussion(projectId, discussionId, message);
    await fetchWorkspace();
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Delete this discussion topic?')) return;
    await workspaceApi.deleteDiscussion(projectId, discussionId);
    await fetchWorkspace();
  };

  // Resource Handlers
  const handleAddResource = async (data) => {
    await workspaceApi.addResource(projectId, data);
    await fetchWorkspace();
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Remove this resource?')) return;
    await workspaceApi.deleteResource(projectId, resourceId);
    await fetchWorkspace();
  };

  // Settings & Evidence
  const handleSaveSettings = async (settings) => {
    setActionLoading(true);
    try {
      await workspaceApi.updateWorkspaceSettings(projectId, settings);
      await fetchWorkspace();
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimEvidence = async (payload) => {
    setActionLoading(true);
    try {
      const res = await workspaceApi.claimSkillEvidence(projectId, payload);
      await fetchWorkspace();
      return res.data;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState rows={4} message="Loading project workspace..." />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="p-8 rounded-2xl glass-card border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Workspace Unavailable</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{error || 'Project workspace not found.'}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/projects')}
          >
            Return to Project Catalog
          </Button>
        </div>
      </div>
    );
  }

  const { project, progress, isCreator, userRole, tasks, milestones, discussions, resources } =
    workspace;

  // Build team members array for task assignment
  const allTeamMembers = [
    { userId: project.creatorId, role: 'Project Lead' },
    ...(project.members || []).filter((m) => m.status === 'ACTIVE'),
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Workspace Top Header */}
      <WorkspaceHeader
        project={project}
        progress={progress}
        isCreator={isCreator}
        userRole={userRole}
        onNewTask={() => handleOpenNewTask('TODO')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClaimEvidence={() => setIsEvidenceModalOpen(true)}
      />

      {/* Workspace Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Kanban Board ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Milestones ({milestones.length})
          </button>

          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'discussions'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Discussions ({discussions.length})
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Resources & Docs ({resources.length})
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Team & Roles ({allTeamMembers.length})
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="mt-6">
          {activeTab === 'kanban' && (
            <KanbanBoard
              tasks={tasks}
              teamMembers={allTeamMembers}
              currentUserId={user?._id}
              onNewTask={handleOpenNewTask}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesSection
              milestones={milestones}
              tasks={tasks}
              onCreateMilestone={handleCreateMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              isCreator={isCreator}
            />
          )}

          {activeTab === 'discussions' && (
            <DiscussionsSection
              discussions={discussions}
              onCreateDiscussion={handleCreateDiscussion}
              onReplyDiscussion={handleReplyDiscussion}
              onDeleteDiscussion={handleDeleteDiscussion}
              currentUserId={user?._id}
              isCreator={isCreator}
            />
          )}

          {activeTab === 'resources' && (
            <ResourcesSection
              resources={resources}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
              currentUserId={user?._id}
              isCreator={isCreator}
            />
          )}

          {activeTab === 'team' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <TeamManagementSection
                project={project}
                currentUserId={user?._id}
                onTeamUpdated={fetchWorkspace}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        initialStatus={defaultTaskStatus}
        teamMembers={allTeamMembers}
        milestones={milestones}
        isLoading={actionLoading}
      />

      {/* Project Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={project}
        onSave={handleSaveSettings}
        isLoading={actionLoading}
      />

      {/* Claim Skill Evidence on Completion Modal */}
      <ClaimEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        project={project}
        userRole={userRole}
        onClaim={handleClaimEvidence}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ProjectWorkspacePage;
