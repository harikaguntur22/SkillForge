import React, { useState, useEffect } from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import * as collaborationApi from '../../services/collaborationApi';
import CollaboratorRecommendationsModal from './CollaboratorRecommendationsModal';
import JoinRequestModal from './JoinRequestModal';
import {
  Users,
  UserPlus,
  LogOut,
  Trash2,
  Edit3,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Inbox,
  ShieldCheck,
  Crown
} from 'lucide-react';

export const TeamManagementSection = ({
  project,
  currentUserId,
  onTeamUpdated,
}) => {
  const [teamData, setTeamData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Editing role state
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');

  // Modals
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const isCreator =
    currentUserId &&
    (project?.creatorId?._id === currentUserId || project?.creatorId === currentUserId);

  const loadTeamAndRequests = async () => {
    if (!project?._id) return;
    setIsLoading(true);
    setError('');
    try {
      const [membersRes, requestsRes] = await Promise.all([
        collaborationApi.getProjectMembers(project._id),
        isCreator
          ? collaborationApi.getProjectCollaborationRequests(project._id)
          : Promise.resolve({ data: [] }),
      ]);

      setTeamData(membersRes.data?.data || null);
      setRequests(requestsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load team data:', err);
      setError(err.message || 'Failed to load team information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamAndRequests();
  }, [project?._id, isCreator]);

  const handleUpdateRole = async (targetUserId) => {
    if (!newRoleName.trim()) return;
    try {
      await collaborationApi.updateProjectMemberRole(project._id, targetUserId, newRoleName.trim());
      setActionSuccess('Member role updated successfully.');
      setEditingUserId(null);
      setNewRoleName('');
      await loadTeamAndRequests();
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (targetUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the project team?`)) {
      return;
    }
    try {
      await collaborationApi.removeProjectMember(project._id, targetUserId);
      setActionSuccess(`${memberName} was removed from the team.`);
      await loadTeamAndRequests();
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      setError(err.message || 'Failed to remove member.');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project team?')) {
      return;
    }
    try {
      await collaborationApi.leaveProject(project._id);
      setActionSuccess('You have left the project team.');
      await loadTeamAndRequests();
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      setError(err.message || 'Failed to leave project.');
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await collaborationApi.respondToCollaborationRequest(requestId, { action });
      setActionSuccess(`Request ${action.toLowerCase()}ed successfully.`);
      await loadTeamAndRequests();
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      setError(err.message || `Failed to ${action.toLowerCase()} request.`);
    }
  };

  const members = teamData?.members || [];
  const isMember = currentUserId && members.some(
    (m) => (m.userId?._id || m.userId).toString() === currentUserId.toString()
  );
  const pendingJoinRequests = requests.filter(
    (r) => r.type === 'JOIN_REQUEST' && r.status === 'PENDING'
  );

  return (
    <div className="space-y-6">
      {/* Header bar with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          <h4 className="text-base font-bold text-white">Project Collaboration & Team</h4>
          <span className="text-xs text-slate-400">
            ({members.length} / {project.teamSize} members)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCreator && (
            <Button
              variant="brand"
              size="xs"
              icon={Sparkles}
              onClick={() => setIsRecommendModalOpen(true)}
              className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white"
            >
              Find Collaborators
            </Button>
          )}

          {!isMember && !isCreator && (
            <Button
              variant="primary"
              size="xs"
              icon={UserPlus}
              onClick={() => setIsJoinModalOpen(true)}
            >
              Request to Join
            </Button>
          )}

          {isMember && !isCreator && (
            <Button
              variant="outline"
              size="xs"
              className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
              icon={LogOut}
              onClick={handleLeaveProject}
            >
              Leave Team
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Incoming Join Requests (Creator View) */}
      {isCreator && pendingJoinRequests.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-brand-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider">
            <Inbox className="w-4 h-4 text-brand-400" />
            <span>Pending Join Applications ({pendingJoinRequests.length})</span>
          </div>

          <div className="space-y-2">
            {pendingJoinRequests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={req.senderId?.name} src={req.senderId?.profileImage} size="sm" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{req.senderId?.name}</span>
                      <Badge variant="purple" size="xs">
                        Applying for: {req.role}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {req.senderId?.college} {req.message && `• "${req.message}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="xs"
                    icon={Check}
                    onClick={() => handleRespondRequest(req._id, 'ACCEPT')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-rose-400 hover:bg-rose-500/10"
                    icon={X}
                    onClick={() => handleRespondRequest(req._id, 'REJECT')}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Team Members List */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Active Team Members
        </h5>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="p-3 bg-slate-950 rounded-xl animate-pulse h-12" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-slate-400 italic p-4 bg-slate-950 rounded-xl text-center">
            No active members registered.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {members.map((member, idx) => {
              const u = member.userId || {};
              const isLead =
                member.role === 'Project Lead' ||
                u._id?.toString() === project.creatorId?._id?.toString();
              const isTargetEditing = editingUserId === u._id;

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name || 'Member'} src={u.profileImage} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.name || 'Student'}</span>
                        {isLead && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-500/20">
                            <Crown className="w-3 h-3" />
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {u.college || 'Student'} {u.targetRole && `• ${u.targetRole}`}
                      </p>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0">
                    {isTargetEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="New role name"
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                        <button
                          onClick={() => handleUpdateRole(u._id)}
                          className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Badge variant={isLead ? 'brand' : 'purple'} size="xs">
                        {member.role || 'Developer'}
                      </Badge>
                    )}

                    {/* Creator Actions on non-lead members */}
                    {isCreator && !isLead && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingUserId(u._id);
                            setNewRoleName(member.role);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-300 rounded hover:bg-slate-900"
                          title="Change Role"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(u._id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-900"
                          title="Remove from Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Defined Required Roles Matrix */}
      {project.requiredRoles && project.requiredRoles.length > 0 && (
        <div className="space-y-3 pt-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Open & Defined Team Roles
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {project.requiredRoles.map((r, idx) => {
              const isFilled = (r.filled || 0) >= (r.spots || 1);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{r.roleName}</span>
                    {r.skills && r.skills.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {r.skills.join(', ')}
                      </span>
                    )}
                  </div>
                  <Badge variant={isFilled ? 'secondary' : 'success'} size="xs">
                    {r.filled || 0}/{r.spots || 1} {isFilled ? 'Filled' : 'Open'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {isRecommendModalOpen && (
        <CollaboratorRecommendationsModal
          isOpen={isRecommendModalOpen}
          onClose={() => setIsRecommendModalOpen(false)}
          project={project}
          onInviteSent={() => loadTeamAndRequests()}
        />
      )}

      {isJoinModalOpen && (
        <JoinRequestModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          project={project}
          onRequestSubmitted={() => loadTeamAndRequests()}
        />
      )}
    </div>
  );
};

export default TeamManagementSection;
