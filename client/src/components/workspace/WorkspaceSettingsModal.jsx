import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WorkspaceSettingsModal = ({
  isOpen,
  onClose,
  project,
  onSave,
  isLoading = false,
}) => {
  const [status, setStatus] = useState('OPEN');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setStatus(project.status || 'OPEN');
      setGithubUrl(project.githubUrl || '');
      setDemoUrl(project.demoUrl || '');
      setError('');
    }
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await onSave({
        status,
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim(),
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to update settings.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Workspace Settings"
      subtitle="Update links, status lifecycle, and repository settings"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Project Lifecycle Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Project Lifecycle Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-brand-500"
          >
            <option value="PLANNING">PLANNING - Initial sprint planning</option>
            <option value="OPEN">OPEN - Recruiting collaborators</option>
            <option value="IN_PROGRESS">IN PROGRESS - Active development</option>
            <option value="COMPLETED">COMPLETED - Shipped & delivered</option>
          </select>
          {status === 'COMPLETED' && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marking as completed unlocks skill evidence verification for all members!
            </p>
          )}
        </div>

        {/* GitHub URL */}
        <Input
          label="GitHub Repository URL"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
        />

        {/* Demo URL */}
        <Input
          label="Live Demo / Deployment URL"
          type="url"
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          placeholder="https://my-demo-app.vercel.app"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="secondary" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkspaceSettingsModal;
