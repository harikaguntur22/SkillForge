import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import * as collaborationApi from '../../services/collaborationApi';
import { Send, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export const JoinRequestModal = ({
  isOpen,
  onClose,
  project,
  onRequestSubmitted,
}) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!project) return null;

  const roles = project.requiredRoles || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select the role you are applying for.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await collaborationApi.requestToJoinProject(project._id, {
        role: selectedRole,
        message: message.trim(),
      });

      setSuccess('Your join request has been sent to the project lead!');
      if (onRequestSubmitted) onRequestSubmitted();
      setTimeout(() => {
        onClose();
        setSuccess('');
        setMessage('');
        setSelectedRole('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit join request:', err);
      setError(err.message || 'Failed to submit join request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request to Join Team"
      subtitle={`Apply to collaborate on ${project.title}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Select Role to Apply For *
          </label>
          {roles.length > 0 ? (
            <div className="space-y-2">
              {roles.map((r, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === r.roleName
                      ? 'bg-brand-500/10 border-brand-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="role"
                      value={r.roleName}
                      checked={selectedRole === r.roleName}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-brand-500 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold block">{r.roleName}</span>
                      {r.skills && r.skills.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          Stack: {r.skills.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Spots: {r.filled || 0}/{r.spots || 1}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Backend Engineer"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Note to Project Lead (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share why you'd like to join, your availability, or relevant deliverables you've built..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={isSubmitting}
            icon={Send}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinRequestModal;
