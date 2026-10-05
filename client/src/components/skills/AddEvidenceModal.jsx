import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { 
  FolderGit2, 
  Briefcase, 
  Globe, 
  Code2, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

export const AddEvidenceModal = ({ isOpen, onClose, userSkill, onEvidenceAdded }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    role: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const skillName = userSkill?.skillId?.name || 'Skill';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    if (!formData.role.trim()) {
      setError('Role in project is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onEvidenceAdded(userSkill._id, formData);
      setFormData({
        projectName: '',
        role: '',
        description: '',
        githubUrl: '',
        demoUrl: '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to attach project evidence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Project Evidence for ${skillName}`}
      subtitle="Demonstrate verified competency by linking real-world software you contributed to."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Project Name"
          name="projectName"
          placeholder="e.g. Distributed Task Queue, Campus E-Commerce"
          icon={FolderGit2}
          value={formData.projectName}
          onChange={handleChange}
        />

        <Input
          label="Your Role / Contribution"
          name="role"
          placeholder="e.g. Lead Backend Engineer, UI Designer"
          icon={Briefcase}
          value={formData.role}
          onChange={handleChange}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Contribution Summary & Technical Highlights
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder={`Describe what you built with ${skillName}, technical architecture, problems solved, or performance metrics...`}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Input
            label="GitHub Repository"
            name="githubUrl"
            placeholder="https://github.com/..."
            icon={Code2}
            value={formData.githubUrl}
            onChange={handleChange}
          />

          <Input
            label="Live Demo URL"
            name="demoUrl"
            placeholder="https://myproject.com"
            icon={Globe}
            value={formData.demoUrl}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={Sparkles}
          >
            Attach Evidence
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEvidenceModal;
