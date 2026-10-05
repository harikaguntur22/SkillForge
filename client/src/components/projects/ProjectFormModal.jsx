import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import {
  Plus,
  Trash2,
  AlertCircle,
  Code2,
  Users,
  Clock,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'AI',
  'Data Science',
  'Mobile',
  'Cloud',
  'Cybersecurity',
  'Other',
];

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  availableSkills = [],
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    category: 'Web Development',
    difficulty: 'INTERMEDIATE',
    estimatedDuration: '4-6 weeks',
    teamSize: 3,
    description: '',
    githubUrl: '',
    demoUrl: '',
    requiredSkills: [],
    deliverables: [],
    tags: '',
    requiredRoles: [],
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSkills, setNewRoleSkills] = useState('');
  const [newRoleSpots, setNewRoleSpots] = useState(1);
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('INTERMEDIATE');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        tagline: initialData.tagline || '',
        category: initialData.category || 'Web Development',
        difficulty: initialData.difficulty || 'INTERMEDIATE',
        estimatedDuration: initialData.estimatedDuration || '4-6 weeks',
        teamSize: initialData.teamSize || 3,
        description: initialData.description || '',
        githubUrl: initialData.githubUrl || '',
        demoUrl: initialData.demoUrl || '',
        requiredSkills: (initialData.requiredSkills || []).map((s) => ({
          skillId: s.skillId?._id || s.skillId,
          name: s.name,
          level: s.level || 'INTERMEDIATE',
          isMandatory: s.isMandatory !== undefined ? s.isMandatory : true,
        })),
        requiredRoles: (initialData.requiredRoles || []).map((r) => ({
          roleName: r.roleName,
          skills: r.skills || [],
          spots: r.spots || 1,
        })),
        deliverables: initialData.deliverables || [],
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        tagline: '',
        category: 'Web Development',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: '4-6 weeks',
        teamSize: 3,
        description: '',
        githubUrl: '',
        demoUrl: '',
        requiredSkills: [],
        requiredRoles: [],
        deliverables: [],
        tags: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'teamSize' ? parseInt(value, 10) || 1 : value,
    }));
    setError('');
  };

  const handleAddSkill = () => {
    if (!selectedSkillToAdd) return;
    const skillObj = availableSkills.find((s) => s._id === selectedSkillToAdd);
    if (!skillObj) return;

    if (formData.requiredSkills.some((s) => s.skillId === skillObj._id)) {
      setError(`Skill "${skillObj.name}" is already in the required skills list.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      requiredSkills: [
        ...prev.requiredSkills,
        {
          skillId: skillObj._id,
          name: skillObj.name,
          level: selectedSkillLevel,
          isMandatory: true,
        },
      ],
    }));
    setSelectedSkillToAdd('');
    setError('');
  };

  const handleRemoveSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s.skillId !== skillId),
    }));
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()],
    }));
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const skills = newRoleSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      requiredRoles: [
        ...(prev.requiredRoles || []),
        {
          roleName: newRoleName.trim(),
          skills,
          spots: parseInt(newRoleSpots, 10) || 1,
        },
      ],
    }));
    setNewRoleName('');
    setNewRoleSkills('');
    setNewRoleSpots(1);
  };

  const handleRemoveRole = (index) => {
    setFormData((prev) => ({
      ...prev,
      requiredRoles: prev.requiredRoles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.requiredSkills.length === 0) {
      setError('Please add at least one required skill for the project.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedDuration: formData.estimatedDuration.trim(),
        teamSize: parseInt(formData.teamSize, 10),
        description: formData.description.trim(),
        githubUrl: formData.githubUrl.trim(),
        demoUrl: formData.demoUrl.trim(),
        requiredSkills: formData.requiredSkills,
        requiredRoles: formData.requiredRoles || [],
        deliverables: formData.deliverables,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      subtitle={
        isEditing
          ? 'Update your project specifications, requirements, and milestones.'
          : 'Publish an engineering project proposal to attract collaborators.'
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title & Tagline */}
        <Input
          label="Project Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. OmniDoc - Multimodal RAG Document Intelligence Engine"
          required
        />

        <Input
          label="Short Tagline (Elevator Pitch)"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          placeholder="e.g. Hybrid semantic RAG system parsing complex scientific research papers."
        />

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration & Team Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Estimated Duration"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            placeholder="e.g. 4-6 weeks"
            icon={Clock}
            required
          />

          <Input
            label="Target Team Size"
            name="teamSize"
            type="number"
            min="1"
            max="12"
            value={formData.teamSize}
            onChange={handleChange}
            icon={Users}
            required
          />
        </div>

        {/* Required Skills Selector */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            Required Skills ({formData.requiredSkills.length})
          </label>

          {/* Add Skill Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <select
              value={selectedSkillToAdd}
              onChange={(e) => setSelectedSkillToAdd(e.target.value)}
              className="w-full sm:flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select skill from catalog...</option>
              {availableSkills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>

            <select
              value={selectedSkillLevel}
              onChange={(e) => setSelectedSkillLevel(e.target.value)}
              className="w-full sm:w-36 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSkill}
              icon={Plus}
            >
              Add
            </Button>
          </div>

          {/* Skills List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {formData.requiredSkills.map((s) => (
              <span
                key={s.skillId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <span>{s.name}</span>
                <span className="text-[10px] text-brand-400 font-bold">({s.level})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s.skillId)}
                  className="text-slate-500 hover:text-rose-400 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {formData.requiredSkills.length === 0 && (
              <p className="text-xs text-slate-500 italic">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Defined Roles Matrix */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Team Roles & Headcount
            </label>
            <span className="text-[11px] text-slate-500">
              Matches students for recommendations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <input
                type="text"
                placeholder="Role Name (e.g. React Developer)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="Stack (e.g. React, Tailwind)"
                value={newRoleSkills}
                onChange={(e) => setNewRoleSkills(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="number"
                min="1"
                max="5"
                value={newRoleSpots}
                onChange={(e) => setNewRoleSpots(e.target.value)}
                title="Number of Spots"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddRole}
                icon={Plus}
                className="w-full h-full justify-center"
              />
            </div>
          </div>

          {/* Defined Roles List */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(formData.requiredRoles || []).map((r, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <span className="font-semibold text-white">{r.roleName}</span>
                <span className="text-[10px] text-brand-400 font-bold">({r.spots} spot{r.spots > 1 ? 's' : ''})</span>
                {r.skills && r.skills.length > 0 && (
                  <span className="text-[10px] text-slate-400">[{r.skills.join(', ')}]</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(idx)}
                  className="text-slate-500 hover:text-rose-400 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(formData.requiredRoles || []).length === 0 && (
              <p className="text-xs text-slate-500 italic">No specific roles defined yet (optional, will auto-derive from stack).</p>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Detailed Description & Architecture
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain the project scope, technical stack choices, target architecture, and problem statement..."
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Deliverables Dynamic List */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Key Deliverables & Objectives
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Set up Dockerized sandboxed code execution runner"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddDeliverable}
              icon={Plus}
            >
              Add
            </Button>
          </div>
          <ul className="space-y-1 pt-1">
            {formData.deliverables.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDeliverable(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags & GitHub URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tags (Comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. React, WebSockets, PairProgramming"
          />

          <Input
            label="GitHub Repository URL"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/org/repo"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={isEditing ? Check : Plus}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
