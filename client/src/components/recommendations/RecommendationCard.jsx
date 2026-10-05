import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Target,
  ExternalLink,
  Code2,
  TrendingUp,
  Compass,
  Repeat
} from 'lucide-react';

export const RecommendationCard = ({
  recommendation,
  onViewDetails,
}) => {
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [showFactorBreakdown, setShowFactorBreakdown] = useState(false);

  if (!recommendation || !recommendation.project) return null;

  const {
    project,
    score = 0,
    readinessStatus = 'NEEDS_PREPARATION',
    breakdown = {},
    matchedSkills = [],
    missingSkills = [],
    skillGaps = [],
    recommendationReason = '',
    reason = '',
    learningPath = [],
  } = recommendation;

  const displayReason = recommendationReason || reason;

  // Total estimated hours from learning path
  const totalLearningHours = learningPath.reduce(
    (acc, step) => acc + (step.estimatedHours || 0),
    0
  );

  // Status Styling
  const getStatusConfig = () => {
    switch (readinessStatus) {
      case 'READY_TO_BUILD':
        return {
          label: 'Ready to Build',
          variant: 'success',
          icon: CheckCircle2,
          borderGlow: 'hover:border-emerald-500/50 shadow-emerald-500/5',
          scoreBadge: 'from-emerald-500 to-teal-600 border-emerald-400/40 text-emerald-200',
        };
      case 'NEEDS_PREPARATION':
        return {
          label: 'Needs Preparation',
          variant: 'brand',
          icon: AlertTriangle,
          borderGlow: 'hover:border-brand-500/50 shadow-brand-500/5',
          scoreBadge: 'from-brand-500 to-indigo-600 border-brand-400/40 text-brand-200',
        };
      case 'STRETCH_PROJECT':
      default:
        return {
          label: 'Stretch Project',
          variant: 'purple',
          icon: TrendingUp,
          borderGlow: 'hover:border-purple-500/50 shadow-purple-500/5',
          scoreBadge: 'from-purple-500 to-pink-600 border-purple-400/40 text-purple-200',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${statusConfig.borderGlow} hover:shadow-xl group`}
    >
      <div className="p-6 space-y-6">
        {/* Top Header: Title, Score Badge, Readiness Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusConfig.variant} size="sm">
                <StatusIcon className="w-3.5 h-3.5 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge variant="brand" size="xs">
                {project.category}
              </Badge>
              <Badge
                variant={
                  project.difficulty === 'ADVANCED'
                    ? 'purple'
                    : project.difficulty === 'INTERMEDIATE'
                    ? 'brand'
                    : 'success'
                }
                size="xs"
              >
                {project.difficulty}
              </Badge>
            </div>

            <h3
              onClick={() => onViewDetails(project)}
              className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors cursor-pointer"
            >
              {project.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {project.tagline || project.description}
            </p>
          </div>

          {/* Circular / Pill Score Indicator */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-inner min-w-[120px] text-center">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Match Score
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${statusConfig.scoreBadge} bg-clip-text text-transparent`}>
                {score}
              </span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Deterministic Rule
            </span>
          </div>
        </div>

        {/* Project Meta Bar: Time, Team Size, Deliverables */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Estimated Time
              </span>
              <span className="font-semibold text-white">{project.estimatedDuration || '4-6 weeks'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Team Size
              </span>
              <span className="font-semibold text-white">{project.teamSize || 3} members</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Milestones
              </span>
              <span className="font-semibold text-white">{project.deliverables?.length || 4} deliverables</span>
            </div>
          </div>
        </div>

        {/* Explainable Recommendation Reason */}
        {displayReason && (
          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Why This Project Matches You</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              "{displayReason}"
            </p>
          </div>
        )}

        {/* 5-Factor Score Breakdown Toggle & Visualizer */}
        <div className="space-y-2">
          <button
            onClick={() => setShowFactorBreakdown(!showFactorBreakdown)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              Transparent Scoring Breakdown (5 Weighted Dimensions)
            </span>
            <div className="flex items-center gap-1 text-brand-400">
              <span>{showFactorBreakdown ? 'Hide Breakdown' : 'View Factors'}</span>
              {showFactorBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showFactorBreakdown && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5 animate-fadeIn">
              {/* Factor 1: Required Skill Match (40%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">1. Required Skill Match (40% max)</span>
                  <span className="text-brand-300 font-bold">{breakdown.skillMatch ?? 0} / 40 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.skillMatch || 0) / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 2: Interest & Category Match (20%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">2. Interest & Category Match (20% max)</span>
                  <span className="text-emerald-300 font-bold">{breakdown.interestMatch ?? 0} / 20 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.interestMatch || 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 3: Difficulty Compatibility (15%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">3. Difficulty Compatibility (15% max)</span>
                  <span className="text-purple-300 font-bold">{breakdown.difficultyCompatibility ?? 0} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.difficultyCompatibility || 0) / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 4: Career Goal Match (15%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">4. Career Goal Match (15% max)</span>
                  <span className="text-amber-300 font-bold">{breakdown.careerGoalMatch ?? 0} / 15 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.careerGoalMatch || 0) / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* Factor 5: Previous Project Relevance (10%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">5. Project Evidence & Relevance (10% max)</span>
                  <span className="text-teal-300 font-bold">{breakdown.previousProjectRelevance ?? 0} / 10 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((breakdown.previousProjectRelevance || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skill Match Visualization: Matched vs Missing */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Skills ({matchedSkills.length})
                </span>
                <span className="text-[11px] text-slate-400">In your profile</span>
              </div>

              {matchedSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No direct skill overlap found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((s, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300"
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-1 py-0.5 rounded">
                        {s.userLevel || s.requiredLevel}
                      </span>
                      {s.isVerified && (
                        <span className="text-[9px] text-emerald-400 font-bold" title="Verified Evidence">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Skills ({missingSkills.length})
                </span>
                <Link
                  to="/skill-exchange"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
                >
                  <Repeat className="w-3 h-3" />
                  Find Mentor
                </Link>
              </div>

              {missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  No missing skills! You satisfy 100% of the stack.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((s, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300"
                    >
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-[10px] text-amber-400/80 bg-amber-950/60 px-1 py-0.5 rounded">
                        Req: {s.requiredLevel}
                      </span>
                      {s.isMandatory && (
                        <span className="text-[9px] text-amber-400 font-bold uppercase">
                          Core
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skill Gaps (known, but needs leveling up) */}
          {skillGaps.length > 0 && (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center gap-2 text-xs text-purple-300">
              <span className="font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                Level-up Gaps:
              </span>
              {skillGaps.map((g, idx) => (
                <span
                  key={idx}
                  className="bg-purple-900/40 border border-purple-500/30 px-2 py-0.5 rounded text-[11px]"
                >
                  {g.name}: currently {g.userLevel} → target {g.requiredLevel}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Recommended Learning Path */}
        {learningPath.length > 0 && (
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowLearningPath(!showLearningPath)}
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-brand-300 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-brand-400" />
                <span>
                  Recommended Learning Path ({learningPath.length} Action Steps, ~{totalLearningHours} hrs)
                </span>
                {showLearningPath ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <span className="text-[11px] text-slate-400 hidden sm:block">
                Bridge your skill gaps systematically
              </span>
            </div>

            {showLearningPath && (
              <div className="space-y-2.5 pt-2 animate-fadeIn">
                {learningPath.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {step.step || idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            Learn {step.skill}
                          </span>
                          <Badge variant="purple" size="xs">
                            Target: {step.targetLevel}
                          </Badge>
                          {step.importance === 'MANDATORY' && (
                            <span className="text-[10px] font-bold text-amber-400 uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {step.action}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 shrink-0">
                      <span className="text-xs text-slate-400 font-medium">
                        ⏱️ ~{step.estimatedHours} hrs
                      </span>
                      <Link
                        to={`/skill-exchange?search=${encodeURIComponent(step.skill)}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        <span>Find Peer</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(project)}
            >
              View Full Specs
            </Button>
            <Link to={`/skill-exchange?search=${encodeURIComponent(project.category)}`}>
              <Button variant="ghost" size="sm" icon={Repeat}>
                Find Collaborator
              </Button>
            </Link>
          </div>

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RecommendationCard;
