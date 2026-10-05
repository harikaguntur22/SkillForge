import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Modal from '../common/Modal';
import {
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';

export const MilestonesSection = ({
  milestones = [],
  tasks = [],
  onCreateMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  isCreator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('PLANNED');

  const openCreateModal = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setTargetDate('');
    setStatus('PLANNED');
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMilestone(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setTargetDate(
      m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : ''
    );
    setStatus(m.status || 'PLANNED');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingMilestone) {
      await onUpdateMilestone(editingMilestone._id, {
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        status,
      });
    } else {
      await onCreateMilestone({
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        status,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleCompleted = async (m) => {
    const nextStatus = m.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    await onUpdateMilestone(m._id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Project Milestones & Deliverables
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track key product phases, release sprints, and deliverable targets.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openCreateModal}
        >
          Add Milestone
        </Button>
      </div>

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No milestones defined yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Define your product development sprints and feature release targets to align the team.
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={openCreateModal}
            className="mt-4"
          >
            Create First Milestone
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const milestoneTasks = tasks.filter(
              (t) =>
                t.milestoneId?._id === milestone._id ||
                t.milestoneId === milestone._id
            );
            const completedCount = milestoneTasks.filter(
              (t) => t.status === 'DONE'
            ).length;
            const taskProgress =
              milestoneTasks.length > 0
                ? Math.round((completedCount / milestoneTasks.length) * 100)
                : 0;

            const isDone = milestone.status === 'COMPLETED';

            return (
              <div
                key={milestone._id}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-900/40 border-emerald-500/20'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleCompleted(milestone)}
                      title={
                        isDone
                          ? 'Mark as in-progress'
                          : 'Mark milestone as completed'
                      }
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30'
                          : 'border-slate-700 bg-slate-950 text-transparent hover:text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm font-bold ${
                            isDone ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {milestone.title}
                        </h4>
                        <Badge
                          variant={
                            isDone
                              ? 'success'
                              : milestone.status === 'IN_PROGRESS'
                              ? 'brand'
                              : 'purple'
                          }
                        >
                          {milestone.status?.replace('_', ' ')}
                        </Badge>
                      </div>

                      {milestone.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}

                      {/* Meta target date */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        {milestone.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Target:{' '}
                            {new Date(
                              milestone.targetDate
                            ).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {completedCount} / {milestoneTasks.length} Linked Tasks
                          Done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {/* Progress Bar */}
                    <div className="w-28 text-right space-y-1">
                      <span className="text-xs font-bold text-white">
                        {taskProgress}%
                      </span>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <button
                      onClick={() => openEditModal(milestone)}
                      title="Edit milestone"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMilestone(milestone._id)}
                      title="Delete milestone"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
        subtitle="Define project phases, sprints, and deliverable targets"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Milestone Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sprint 2: Real-time Collab MVP"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Key deliverable criteria and targets..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingMilestone ? 'Save Milestone' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MilestonesSection;
