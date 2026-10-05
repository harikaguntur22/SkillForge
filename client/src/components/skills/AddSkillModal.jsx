import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Sparkles, 
  Check, 
  Plus, 
  AlertCircle,
  GraduationCap,
  Repeat
} from 'lucide-react';
import * as skillApi from '../../services/skillApi';

const CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'Database',
  'AI/ML',
  'DevOps/Cloud',
  'UI/UX',
  'Mobile',
];

export const AddSkillModal = ({ isOpen, onClose, defaultType = 'TEACH', onSkillAdded }) => {
  const [type, setType] = useState(defaultType);
  const [canonicalSkills, setCanonicalSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Custom skill creation state
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Frontend');

  const [level, setLevel] = useState('INTERMEDIATE');
  const [yearsExperience, setYearsExperience] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setType(defaultType);
    setLevel(defaultType === 'TEACH' ? 'INTERMEDIATE' : 'BEGINNER');
  }, [defaultType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCatalog = async () => {
      try {
        const res = await skillApi.getSkills();
        setCanonicalSkills(res?.data?.skills || []);
      } catch (err) {
        console.error('Failed to load canonical skills catalog:', err);
      }
    };
    fetchCatalog();
  }, [isOpen]);

  useEffect(() => {
    let list = canonicalSkills;
    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    setFilteredSkills(list);
  }, [canonicalSkills, selectedCategory, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isCustom && !selectedSkill) {
      setError('Please select a skill from the list or choose to add a custom skill.');
      return;
    }

    if (isCustom && !customName.trim()) {
      setError('Please provide a name for your custom skill.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type,
        level,
        yearsExperience: type === 'TEACH' ? Number(yearsExperience) || 0 : 0,
      };

      if (isCustom) {
        payload.skillName = customName.trim();
        payload.category = customCategory;
      } else {
        payload.skillId = selectedSkill._id;
      }

      await onSkillAdded(payload);
      handleReset();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedSkill(null);
    setIsCustom(false);
    setCustomName('');
    setSearch('');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Add Skill to Profile"
      subtitle="Define your teaching specialties or skills you are seeking to learn."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Intent Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Skill Purpose / Intent
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('TEACH');
                if (level === 'BEGINNER') setLevel('INTERMEDIATE');
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                type === 'TEACH'
                  ? 'bg-brand-500/10 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <GraduationCap className={`w-5 h-5 shrink-0 ${type === 'TEACH' ? 'text-brand-400' : 'text-slate-500'}`} />
              <div>
                <p className="font-semibold text-xs text-white">Skills I Can Teach</p>
                <p className="text-[11px] text-slate-400">Offer mentorship & pair on projects</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('LEARN');
                setLevel('BEGINNER');
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                type === 'LEARN'
                  ? 'bg-purple-500/10 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Repeat className={`w-5 h-5 shrink-0 ${type === 'LEARN' ? 'text-purple-400' : 'text-slate-500'}`} />
              <div>
                <p className="font-semibold text-xs text-white">Skills I Want to Learn</p>
                <p className="text-[11px] text-slate-400">Match with peer mentors & projects</p>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Switch: Standard Catalog vs Custom */}
        {!isCustom ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Skill from Catalog
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustom(true);
                  setSelectedSkill(null);
                }}
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                + Add Custom Skill
              </button>
            </div>

            <Input
              icon={Search}
              placeholder="Search skills (e.g. React, Python, Docker)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Skill Selector List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
              {filteredSkills.map((s) => {
                const isSelected = selectedSkill?._id === s._id;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setSelectedSkill(s)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium text-left border transition-all ${
                      isSelected
                        ? 'bg-brand-500/20 border-brand-500 text-white'
                        : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                  </button>
                );
              })}
              {filteredSkills.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-slate-500">
                  No matching skills found in catalog.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustom(true);
                      setCustomName(search);
                    }}
                    className="text-brand-400 underline"
                  >
                    Add "{search}" as custom skill
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                Create New Custom Skill
              </span>
              <button
                type="button"
                onClick={() => setIsCustom(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to Catalog
              </button>
            </div>

            <Input
              label="Skill Name"
              placeholder="e.g. GraphQL, Apache Kafka, Solidity"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Level and Experience Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Proficiency Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="BEGINNER">Beginner (Foundations)</option>
              <option value="INTERMEDIATE">Intermediate (Built Projects)</option>
              <option value="ADVANCED">Advanced (Production Experience)</option>
              <option value="EXPERT">Expert (Architecture & Mentoring)</option>
            </select>
          </div>

          {type === 'TEACH' ? (
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
          ) : (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Priority
              </label>
              <div className="py-2.5 text-xs text-slate-400">
                Will be ranked for mentor and project recommendations in Phase 3 & 5.
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={!isCustom && !selectedSkill}
            icon={Plus}
          >
            Add to My Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSkillModal;
