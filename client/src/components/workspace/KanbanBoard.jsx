import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import { Button } from '../common/Button';
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  HelpCircle,
  Eye,
  ListTodo,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'TODO',
    title: 'TODO',
    color: 'text-slate-300',
    dotColor: 'bg-slate-400',
    borderColor: 'border-slate-800',
    headerBg: 'bg-slate-900/60',
    icon: ListTodo,
  },
  {
    id: 'IN_PROGRESS',
    title: 'IN PROGRESS',
    color: 'text-sky-400',
    dotColor: 'bg-sky-400',
    borderColor: 'border-sky-500/20',
    headerBg: 'bg-sky-950/20',
    icon: Clock,
  },
  {
    id: 'REVIEW',
    title: 'REVIEW',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    borderColor: 'border-amber-500/20',
    headerBg: 'bg-amber-950/20',
    icon: Eye,
  },
  {
    id: 'DONE',
    title: 'DONE',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500/20',
    headerBg: 'bg-emerald-950/20',
    icon: CheckCircle2,
  },
];

export const KanbanBoard = ({
  tasks = [],
  teamMembers = [],
  currentUserId,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  // Filter tasks based on search text, priority, and assignee
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search match
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Priority match
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee match
      if (assigneeFilter === 'ME') {
        if (!task.assigneeId || task.assigneeId._id !== currentUserId) {
          return false;
        }
      } else if (assigneeFilter === 'UNASSIGNED') {
        if (task.assigneeId) return false;
      } else if (assigneeFilter !== 'ALL') {
        if (!task.assigneeId || task.assigneeId._id !== assigneeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchTerm, priorityFilter, assigneeFilter, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Controls & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title or stack..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 max-w-[160px]"
            >
              <option value="ALL">All Members</option>
              <option value="ME">Assigned to Me</option>
              <option value="UNASSIGNED">Unassigned</option>
              {teamMembers.map((member) => {
                const u = member.userId || member;
                return (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* New Task Button */}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => onNewTask('TODO')}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* 4-Column Kanban Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          const IconComponent = column.icon;

          return (
            <div
              key={column.id}
              className="flex flex-col bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm min-h-[500px]"
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b border-slate-800/80 flex items-center justify-between ${column.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${column.color}`} />
                  <h3 className={`text-xs font-extrabold tracking-wider ${column.color}`}>
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onNewTask(column.id)}
                  title={`Add task to ${column.title}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)]">
                {colTasks.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center p-4 border border-dashed border-slate-850 rounded-xl text-center">
                    <p className="text-xs text-slate-500 font-medium">No tasks in this lane</p>
                    <button
                      onClick={() => onNewTask(column.id)}
                      className="mt-2 text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      currentUserId={currentUserId}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
