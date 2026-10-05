import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  GitBranch,
  ExternalLink,
  Plus,
  Settings,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkspaceHeader = ({
  project,
  progress,
  isCreator,
  userRole,
  onNewTask,
  onOpenSettings,
  onClaimEvidence,
}) => {
  const navigate = useNavigate();

  if (!project) return null;

  const isCompleted = project.status === 'COMPLETED';

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects Catalog
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Your Project Role:</span>
          <Badge variant="brand" className="font-semibold">
            {userRole || (isCreator ? 'Project Lead' : 'Collaborator')}
          </Badge>
          <Badge
            variant={
              project.status === 'COMPLETED'
                ? 'success'
                : project.status === 'IN_PROGRESS'
                ? 'brand'
                : 'purple'
            }
          >
            {project.status?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Title, Tagline & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <Badge variant="outline" className="text-slate-300 border-slate-700">
              {project.category}
            </Badge>
            <Badge
              variant={
                project.difficulty === 'ADVANCED'
                  ? 'purple'
                  : project.difficulty === 'INTERMEDIATE'
                  ? 'brand'
                  : 'success'
              }
            >
              {project.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* GitHub Link */}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all shadow-sm"
            >
              <GitBranch className="w-4 h-4" />
              Repository
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* Demo URL Link */}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-xs font-semibold text-brand-300 border border-brand-500/30 transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </a>
          )}

          {/* Claim Evidence Button (active when project is completed) */}
          {isCompleted ? (
            <Button
              variant="primary"
              size="sm"
              icon={Award}
              onClick={onClaimEvidence}
              className="bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/40 border border-emerald-400/30"
            >
              Claim Skill Evidence
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Award}
              onClick={onClaimEvidence}
              className="text-slate-400 border-slate-700 hover:text-white"
              title="Available when project is marked COMPLETED"
            >
              Claim Evidence
            </Button>
          )}

          {/* New Task Button */}
          <Button variant="primary" size="sm" icon={Plus} onClick={onNewTask}>
            New Task
          </Button>

          {/* Settings Button */}
          {isCreator && (
            <Button
              variant="outline"
              size="sm"
              icon={Settings}
              onClick={onOpenSettings}
              className="text-slate-300 hover:text-white border-slate-700"
            >
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Progress & Metrics Strip */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Bar Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              Project Progress
            </span>
            <span className="text-white font-bold text-sm">
              {progress?.percentage || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                progress?.percentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-500'
              }`}
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Tasks Metric */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed Tasks</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {progress?.completedTasks || 0}
              <span className="text-xs text-slate-500 font-normal">
                {' '}
                / {progress?.totalTasks || 0} Total
              </span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Milestones Metric */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Milestones</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {progress?.milestonesCompleted || 0}
              <span className="text-xs text-slate-500 font-normal">
                {' '}
                / {progress?.milestonesTotal || 0} Delivered
              </span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Active Collaborators */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Team Members</p>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {(project.members || []).filter((m) => m.status === 'ACTIVE').length || 1}
              <span className="text-xs text-slate-500 font-normal">
                {' '}
                / {project.teamSize} Capacity
              </span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
