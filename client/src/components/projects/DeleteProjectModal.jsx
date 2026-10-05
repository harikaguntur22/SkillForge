import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { AlertCircle, Trash2 } from 'lucide-react';

export const DeleteProjectModal = ({
  isOpen,
  onClose,
  project,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!project) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm(project._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project Proposal"
      subtitle="This action cannot be undone."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
          <p className="font-semibold text-rose-200">
            Are you sure you want to permanently delete "{project.title}"?
          </p>
          <p className="text-slate-400">
            All project data, milestones, and required skill associations will be removed from the catalog.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="md"
            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            onClick={handleDelete}
            isLoading={isDeleting}
            icon={Trash2}
          >
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
