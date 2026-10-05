import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ClaimEvidenceModal = ({
  isOpen,
  onClose,
  project,
  userRole,
  onClaim,
  isLoading = false,
}) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [claimedResult, setClaimedResult] = useState(null);

  useEffect(() => {
    if (project) {
      const skills = (project.requiredSkills || []).map((s) => s.name);
      setSelectedSkills(skills);
      setRole(userRole || 'Collaborator');
      setDescription(
        `Architected and delivered ${project.title}. Stack utilized: ${skills.join(
          ', '
        )}. Completed project milestone on SkillForge.`
      );
      setError('');
      setClaimedResult(null);
    }
  }, [project, userRole, isOpen]);

  if (!project) return null;

  const isCompleted = project.status === 'COMPLETED';

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!isCompleted) {
      setError(
        'Project status must be COMPLETED before evidence can be attached to your profile.'
      );
      return;
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill to attach evidence to.');
      return;
    }

    try {
      setError('');
      const res = await onClaim({
        skillNames: selectedSkills,
        role: role.trim(),
        description: description.trim(),
      });
      setClaimedResult(res);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to claim evidence.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Project as Skill Evidence"
      subtitle="Elevate your profile with verified proof of work from completed projects"
      maxWidth="max-w-lg"
    >
      {claimedResult ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white">
              Evidence Successfully Verified!
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {claimedResult.attachedSkillsCount} skill(s) on your profile have been updated with verified evidence from{' '}
              <strong className="text-white">{project.title}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {selectedSkills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {s} Verified
              </span>
            ))}
          </div>

          <div className="pt-4">
            <Button variant="primary" size="md" onClick={onClose} className="w-full">
              Done & Return to Workspace
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isCompleted && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Project In Progress
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Skill evidence is granted once the project is marked <strong>COMPLETED</strong>.
                If you have finished all tasks, ask the project creator to update the status in Settings!
              </p>
            </div>
          )}

          {/* Select Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Skills to Verify with this Project
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              {(project.requiredSkills || []).map((skill) => {
                const isSelected = selectedSkills.includes(skill.name);
                return (
                  <button
                    type="button"
                    key={skill.name}
                    onClick={() => toggleSkill(skill.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500/40 text-brand-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-brand-400' : 'text-slate-600'
                      }`}
                    />
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role on Project */}
          <Input
            label="Your Role in this Project"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Engineer / React Developer"
            required
          />

          {/* Contribution Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contribution Summary (Attached to your Profile Evidence)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What components or APIs did you build and deliver?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Preview of Project Evidence */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Evidence Preview on Your Profile
            </span>
            <div className="text-slate-300">
              <p className="font-bold text-white">{project.title}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Role: {role || 'Collaborator'} • Verified through SkillForge Project Workspace
              </p>
              {project.githubUrl && (
                <p className="text-brand-400 text-[11px] mt-1 truncate">
                  {project.githubUrl}
                </p>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={Award}
              disabled={!isCompleted}
              isLoading={isLoading}
              className={isCompleted ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/40' : ''}
            >
              Verify & Add Evidence
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ClaimEvidenceModal;
