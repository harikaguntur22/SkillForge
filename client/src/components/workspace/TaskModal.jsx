import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  initialStatus = 'TODO',
  teamMembers = [],
  milestones = [],
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'TODO');
      setPriority(initialData.priority || 'MEDIUM');
      setAssigneeId(initialData.assigneeId?._id || initialData.assigneeId || '');
      setDueDate(
        initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : ''
      );
      setMilestoneId(
        initialData.milestoneId?._id || initialData.milestoneId || ''
      );
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus || 'TODO');
      setPriority('MEDIUM');
      setAssigneeId('');
      setDueDate('');
      setMilestoneId('');
    }
    setError('');
  }, [initialData, initialStatus, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        milestoneId: milestoneId || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Kanban Task' : 'Create Kanban Task'}
      subtitle="Organize team work with priorities, deadlines, and milestone links"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Title */}
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement WebSocket heartbeat & reconnection"
          required
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Details, technical acceptance criteria, or relevant links..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Status & Priority Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lane Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent 🔥</option>
            </select>
          </div>
        </div>

        {/* Assignee & Milestone Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Unassigned</option>
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Milestone (Optional)
            </label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">None</option>
              {milestones.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="secondary" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isLoading}
          >
            {initialData ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
