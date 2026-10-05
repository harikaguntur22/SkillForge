import React from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import {
  Calendar,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Trash2,
  Layers,
  User,
  Clock,
} from 'lucide-react';

const PRIORITY_STYLES = {
  URGENT: {
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    dot: 'bg-rose-500',
  },
  HIGH: {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    dot: 'bg-amber-500',
  },
  MEDIUM: {
    bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    dot: 'bg-sky-500',
  },
  LOW: {
    bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
    dot: 'bg-slate-400',
  },
};

const STATUS_SEQUENCE = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
}) => {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;

  const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_SEQUENCE.length - 1;

  const prevStatus = canMoveLeft ? STATUS_SEQUENCE[currentIndex - 1] : null;
  const nextStatus = canMoveRight ? STATUS_SEQUENCE[currentIndex + 1] : null;

  const isOverdue =
    task.dueDate &&
    task.status !== 'DONE' &&
    new Date(task.dueDate).getTime() < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="group relative bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top Row: Priority Badge & Milestone */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${priorityStyle.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
          {task.priority}
        </span>

        {task.milestoneId && (
          <span className="flex items-center gap-1 text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md truncate max-w-[130px]">
            <Layers className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{task.milestoneId.title}</span>
          </span>
        )}
      </div>

      {/* Task Title & Description */}
      <h4 className="text-sm font-bold text-white leading-snug group-hover:text-brand-300 transition-colors">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Due Date Indicator */}
      {formattedDueDate && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              isOverdue
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            ) : (
              <Calendar className="w-3 h-3 text-slate-400" />
            )}
            Due {formattedDueDate}
          </span>
        </div>
      )}

      {/* Bottom Footer: Assignee & Action Controls */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-2">
          {task.assigneeId ? (
            <div className="flex items-center gap-1.5" title={task.assigneeId.name}>
              <Avatar
                src={task.assigneeId.avatar}
                name={task.assigneeId.name}
                size="xs"
              />
              <span className="text-xs text-slate-300 font-medium truncate max-w-[90px]">
                {task.assigneeId.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <User className="w-3 h-3" />
              Unassigned
            </span>
          )}
        </div>

        {/* Quick Shift & Edit Actions */}
        <div className="flex items-center gap-1">
          {/* Shift Left */}
          {canMoveLeft && (
            <button
              onClick={() => onStatusChange(task._id, prevStatus)}
              title={`Move to ${prevStatus.replace('_', ' ')}`}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Shift Right */}
          {canMoveRight && (
            <button
              onClick={() => onStatusChange(task._id, nextStatus)}
              title={`Move to ${nextStatus.replace('_', ' ')}`}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit Task */}
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1 rounded-md text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Task */}
          <button
            onClick={() => onDelete(task._id)}
            title="Delete task"
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
