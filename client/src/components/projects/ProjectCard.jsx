import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Users,
  Clock,
  Code2,
  ExternalLink,
  Edit3,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Cpu,
  Smartphone,
  Cloud,
  Database,
  Globe,
  LayoutDashboard,
} from 'lucide-react';

export const ProjectCard = ({
  project,
  currentUserId,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const isOwner =
    currentUserId &&
    (project.creatorId?._id === currentUserId || project.creatorId === currentUserId);

  const isMember = (project.members || []).some(
    (m) =>
      (m.userId?._id || m.userId)?.toString() === currentUserId?.toString() &&
      m.status === 'ACTIVE'
  );
  const hasWorkspaceAccess = isOwner || isMember;

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Web Development':
        return {
          icon: Globe,
          badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        };
      case 'AI':
        return {
          icon: Cpu,
          badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        };
      case 'Data Science':
        return {
          icon: Database,
          badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        };
      case 'Mobile':
        return {
          icon: Smartphone,
          badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        };
      case 'Cloud':
        return {
          icon: Cloud,
          badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        };
      case 'Cybersecurity':
        return {
          icon: Shield,
          badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        };
      default:
        return {
          icon: Layers,
          badgeColor: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
        };
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'BEGINNER':
        return <Badge variant="success" size="xs">Beginner</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="brand" size="xs">Intermediate</Badge>;
      case 'ADVANCED':
        return <Badge variant="purple" size="xs">Advanced</Badge>;
      default:
        return <Badge size="xs">{diff}</Badge>;
    }
  };

  const { icon: CategoryIcon, badgeColor } = getCategoryTheme(project.category);

  return (
    <Card
      hoverEffect
      className="flex flex-col justify-between border-slate-800 bg-slate-900/70 p-5 space-y-4 group transition-all"
    >
      <div className="space-y-3.5">
        {/* Top Header: Category & Difficulty */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold tracking-wide ${badgeColor}`}
          >
            <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{project.category}</span>
          </span>

          <div className="flex items-center gap-2">
            {getDifficultyBadge(project.difficulty)}
            {isOwner && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Mine
              </span>
            )}
          </div>
        </div>

        {/* Title and Tagline */}
        <div>
          <h3
            onClick={() => onViewDetails(project)}
            className="text-base font-bold text-white group-hover:text-brand-300 transition-colors cursor-pointer line-clamp-1"
          >
            {project.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* Specs: Team Size & Duration */}
        <div className="flex items-center gap-4 text-xs text-slate-400 py-1.5 border-y border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <strong className="text-slate-200">{project.teamSize}</strong> members
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <strong className="text-slate-200">{project.estimatedDuration}</strong>
          </span>
        </div>

        {/* Required Skills Matrix */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Required Skills ({project.requiredSkills?.length || 0}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills?.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-medium"
              >
                {skill.name}{' '}
                <span className="text-brand-400 font-semibold text-[10px]">
                  ({skill.level ? skill.level.slice(0, 3) : 'Any'})
                </span>
              </span>
            ))}
            {project.requiredSkills?.length > 4 && (
              <span className="text-[11px] text-slate-500 self-center">
                +{project.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Creator & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={project.creatorId?.name || 'Student'}
            src={project.creatorId?.profileImage}
            size="xs"
          />
          <div className="truncate">
            <span className="text-xs text-slate-300 font-medium truncate block">
              {project.creatorId?.name || 'Student Creator'}
            </span>
            <span className="text-[10px] text-slate-500 truncate block">
              {project.creatorId?.college || 'University'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-1.5 text-slate-400 hover:text-brand-300 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {hasWorkspaceAccess && (
            <Link
              to={`/projects/${project._id}/workspace`}
              className="p-1.5 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors"
              title="Open Project Workspace"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onViewDetails(project)}
            className="text-brand-400 hover:text-brand-300"
            icon={ArrowRight}
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
