import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import TeamManagementSection from '../collaboration/TeamManagementSection';
import {
  Users,
  Clock,
  Code2,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Layers,
  Globe,
  GitBranch,
  Tag,
  Sparkles,
  Info,
  LayoutDashboard,
} from 'lucide-react';

export const ProjectDetailModal = ({
  isOpen,
  onClose,
  project,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = useNavigate();

  if (!project) return null;

  const isOwner =
    currentUserId &&
    (project.creatorId?._id === currentUserId || project.creatorId === currentUserId);

  const isMember = (project.members || []).some(
    (m) =>
      (m.userId?._id || m.userId)?.toString() === currentUserId?.toString() &&
      m.status === 'ACTIVE'
  );
  const hasWorkspaceAccess = isOwner || isMember;

  const creator = project.creatorId || {};
  const activeMembersCount =
    (project.members || []).filter((m) => m.status === 'ACTIVE').length || 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      subtitle={project.tagline || `${project.category} Project`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Project Overview
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'team'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team & Collaboration ({activeMembersCount}/{project.teamSize})
          </button>
        </div>

        {activeTab === 'team' ? (
          <TeamManagementSection
            project={project}
            currentUserId={currentUserId}
            onTeamUpdated={() => {}}
          />
        ) : (
          <>
        {/* Meta Header Badges */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-800">
          <Badge variant="brand">{project.category}</Badge>
          <Badge
            variant={
              project.difficulty === 'ADVANCED'
                ? 'purple'
                : project.difficulty === 'INTERMEDIATE'
                ? 'brand'
                : 'success'
            }
          >
            {project.difficulty} Difficulty
          </Badge>
          <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>Recommended Team Size: <strong>{project.teamSize} members</strong></span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Duration: <strong>{project.estimatedDuration}</strong></span>
          </span>
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Project Overview & Architecture
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {project.description}
          </p>
        </div>

        {/* Required Skills Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-400" />
            Required Skills & Proficiency Targets ({project.requiredSkills?.length || 0})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {project.requiredSkills?.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  <span className="font-semibold text-white">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="xs">
                    {skill.level}
                  </Badge>
                  {skill.isMandatory && (
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Core
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables / Key Milestones */}
        {project.deliverables && project.deliverables.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Key Deliverables & Milestones
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {project.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Creator Info Card */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar name={creator.name || 'Student'} src={creator.profileImage} size="md" />
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-400 block tracking-wider">
                Project Lead / Creator
              </span>
              <h5 className="text-sm font-bold text-white">{creator.name || 'Anonymous Student'}</h5>
              <p className="text-xs text-slate-400">{creator.college || 'University'}</p>
            </div>
          </div>

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-200 transition-colors"
            >
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        </>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(project);
                  }}
                  icon={Edit3}
                >
                  Edit Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  onClick={() => {
                    onClose();
                    onDelete(project);
                  }}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasWorkspaceAccess && (
              <Button
                variant="primary"
                size="md"
                icon={LayoutDashboard}
                className="bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-950/40"
                onClick={() => {
                  onClose();
                  navigate(`/projects/${project._id}/workspace`);
                }}
              >
                Open Workspace
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectDetailModal;
