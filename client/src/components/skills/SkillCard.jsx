import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  CheckCircle2, 
  ExternalLink, 
  Code2, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Briefcase,
  Layers
} from 'lucide-react';

const LEVEL_COLORS = {
  BEGINNER: { variant: 'default', label: 'Beginner' },
  INTERMEDIATE: { variant: 'brand', label: 'Intermediate' },
  ADVANCED: { variant: 'purple', label: 'Advanced' },
  EXPERT: { variant: 'success', label: 'Expert' },
};

export const SkillCard = ({
  userSkill,
  onUpdateLevel,
  onDeleteSkill,
  onOpenAddEvidence,
  onDeleteEvidence,
}) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const skill = userSkill.skillId || {};
  const isTeach = userSkill.type === 'TEACH';
  const evidenceCount = userSkill.evidence?.length || 0;

  const handleLevelChange = async (e) => {
    const newLevel = e.target.value;
    setIsUpdating(true);
    try {
      await onUpdateLevel(userSkill._id, { level: newLevel });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card hoverEffect className="space-y-4 border-slate-800 bg-slate-900/70">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">{skill.name}</h4>
            {userSkill.isVerified && (
              <span title="Verified with Project Evidence">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            {skill.category || 'General'}
          </span>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2">
          <select
            value={userSkill.level}
            onChange={handleLevelChange}
            disabled={isUpdating}
            className="text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
      </div>

      {/* Teach vs Learn Specific Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          {isTeach ? (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {userSkill.yearsExperience || 0} {userSkill.yearsExperience === 1 ? 'yr' : 'yrs'} exp
            </span>
          ) : (
            <Badge variant="brand" size="xs">Goal: Master Skill</Badge>
          )}

          {isTeach && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              {evidenceCount} {evidenceCount === 1 ? 'project proof' : 'project proofs'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDeleteSkill(userSkill._id)}
          className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded"
          title="Remove skill"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Evidence Section for TEACH skills */}
      {isTeach && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {evidenceCount > 0 ? `${showEvidence ? 'Hide' : 'View'} Evidence (${evidenceCount})` : 'No Evidence Yet'}
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAddEvidence(userSkill)}
              icon={Plus}
              className="text-xs py-1 px-2.5"
            >
              Add Evidence
            </Button>
          </div>

          {showEvidence && evidenceCount > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              {userSkill.evidence.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{item.projectName}</p>
                      <p className="text-slate-400 text-[11px]">Role: {item.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteEvidence(userSkill._id, item._id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded"
                      title="Delete evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">{item.description}</p>

                  <div className="flex items-center gap-3 pt-1">
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 underline"
                      >
                        <Code2 className="w-3 h-3" />
                        Repository
                      </a>
                    )}
                    {item.demoUrl && (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SkillCard;
