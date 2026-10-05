import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import * as collaborationApi from '../../services/collaborationApi';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Target,
  Layers,
  GraduationCap,
  MessageSquare,
  Users,
  Compass,
  RefreshCw
} from 'lucide-react';

export const CollaboratorRecommendationsModal = ({
  isOpen,
  onClose,
  project,
  onInviteSent,
}) => {
  const [roleRecommendations, setRoleRecommendations] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitingCandidate, setInvitingCandidate] = useState(null);
  const [inviteRole, setInviteRole] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadRecommendations = async () => {
    if (!project) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await collaborationApi.getRecommendedCollaborators(project._id);
      setRoleRecommendations(res.data?.data?.roleRecommendations || []);
    } catch (err) {
      console.error('Failed to load collaborator recommendations:', err);
      setError(err.message || 'Failed to calculate collaborator recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && project) {
      loadRecommendations();
      setActionSuccess('');
      setInvitingCandidate(null);
    }
  }, [isOpen, project]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!invitingCandidate || !inviteRole) return;

    setIsSubmitting(true);
    setError('');
    try {
      await collaborationApi.inviteCollaborator(project._id, {
        candidateUserId: invitingCandidate._id,
        role: inviteRole,
        message: inviteMessage,
      });

      setActionSuccess(`Invitation sent to ${invitingCandidate.name} for ${inviteRole}!`);
      setInvitingCandidate(null);
      setInviteMessage('');
      if (onInviteSent) onInviteSent();
      await loadRecommendations();
    } catch (err) {
      console.error('Failed to send invite:', err);
      setError(err.message || 'Failed to send collaboration invite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Collaborator Matchmaker"
      subtitle={`AI/Rule-based candidate recommendations for ${project.title}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-brand-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Role-Specific Skill Matching
            </span>
            <p className="text-slate-300">
              Students evaluated against your project's open roles based on required skills (40%), interests (20%), difficulty level (15%), career targets (15%), and verified evidence (10%).
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadRecommendations}
            isLoading={isLoading}
            icon={RefreshCw}
            className="shrink-0"
          >
            Refresh Candidates
          </Button>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Invite Dialog Box if candidate selected */}
        {invitingCandidate && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-brand-500/30 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={invitingCandidate.name} src={invitingCandidate.profileImage} size="sm" />
                <div>
                  <h4 className="text-sm font-bold text-white">Invite {invitingCandidate.name}</h4>
                  <p className="text-xs text-slate-400">{invitingCandidate.college}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setInvitingCandidate(null)}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Project Role *
                </label>
                <input
                  type="text"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  placeholder="e.g. React Developer, Node.js Developer"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Personal Invitation Note (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey, we love your React deliverables and want to collaborate on the canvas whiteboard UI..."
                  rows={2}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setInvitingCandidate(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                  icon={Send}
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Recommendations By Role */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="p-4 rounded-xl bg-slate-950 border border-slate-800 animate-pulse space-y-3">
                <div className="h-5 bg-slate-800 rounded w-1/4" />
                <div className="h-16 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : roleRecommendations.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Candidate Recommendations Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All eligible candidates may already be on your team or have pending invitations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {roleRecommendations.map((roleGroup, rIdx) => (
              <div key={rIdx} className="space-y-3">
                {/* Role Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                    <h4 className="text-sm font-bold text-white">
                      Target Role: <span className="text-brand-300">{roleGroup.role.roleName}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      ({roleGroup.role.skills?.join(', ') || 'General Stack'})
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Spots: {roleGroup.role.filled || 0}/{roleGroup.role.spots || 1} filled
                  </span>
                </div>

                {/* Candidate Cards */}
                {roleGroup.recommendedCandidates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                    No matching candidates found for this specific role.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {roleGroup.recommendedCandidates.map((cand, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <Avatar
                              name={cand.candidate.name}
                              src={cand.candidate.profileImage}
                              size="md"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-white">{cand.candidate.name}</h5>
                                <Badge variant="brand" size="xs">
                                  {cand.candidate.targetRole || 'Developer'}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400">
                                {cand.candidate.college} • {cand.candidate.branch || 'CS'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            {/* Score indicator */}
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Match Score
                              </span>
                              <span className="text-lg font-black text-brand-300">
                                {cand.score}%
                              </span>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              icon={Send}
                              onClick={() => {
                                setInvitingCandidate(cand.candidate);
                                setInviteRole(roleGroup.role.roleName);
                                setInviteMessage(`Hi ${cand.candidate.name}, we'd love for you to join our team as a ${roleGroup.role.roleName} on ${project.title}!`);
                              }}
                            >
                              Invite
                            </Button>
                          </div>
                        </div>

                        {/* Explainable recommendation reason */}
                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs text-slate-300">
                          <p className="italic">
                            💡 "{cand.recommendationReason}"
                          </p>
                        </div>

                        {/* Matched Skills Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] text-slate-400 font-semibold mr-1">
                            Relevant Skills:
                          </span>
                          {cand.matchedSkills.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium"
                            >
                              {s.name} ({s.level})
                              {s.evidenceCount > 0 && ` • ${s.evidenceCount} deliverable`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CollaboratorRecommendationsModal;
