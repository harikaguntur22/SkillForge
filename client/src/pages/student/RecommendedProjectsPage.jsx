import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { LoadingState } from '../../components/common/LoadingState';
import RecommendationCard from '../../components/recommendations/RecommendationCard';
import ProjectDetailModal from '../../components/projects/ProjectDetailModal';
import * as projectApi from '../../services/projectApi';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  FolderGit2,
  Layers,
  Compass,
  GraduationCap,
  Target
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Web Development',
  'AI',
  'Data Science',
  'Mobile',
  'Cloud',
  'Cybersecurity',
];

const READINESS_TABS = [
  { id: 'ALL', label: 'All Recommendations' },
  { id: 'READY_TO_BUILD', label: 'Ready to Build', icon: CheckCircle2, color: 'text-emerald-400' },
  { id: 'NEEDS_PREPARATION', label: 'Needs Preparation', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 'STRETCH_PROJECT', label: 'Stretch Goals', icon: TrendingUp, color: 'text-purple-400' },
];

export const RecommendedProjectsPage = () => {
  const { user } = useAuth();

  // State
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [activeReadinessTab, setActiveReadinessTab] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState(0);

  // Modal State
  const [detailProject, setDetailProject] = useState(null);

  // Fetch Recommendations
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (activeReadinessTab !== 'ALL') params.readinessStatus = activeReadinessTab;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
      if (minScore > 0) params.minScore = minScore;
      params.limit = 50;

      const res = await projectApi.getRecommendedProjects(params);
      setRecommendations(res.data || []);
      setStats(res.stats || null);
      setUserProfile(res.userProfile || null);
    } catch (err) {
      console.error('Failed to load project recommendations:', err);
      setError(err.message || 'Failed to calculate project recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeReadinessTab, selectedCategory, selectedDifficulty, minScore]);

  // Client-side search filtering
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) return recommendations;
    const q = searchQuery.toLowerCase().trim();

    return recommendations.filter((rec) => {
      const p = rec.project;
      const titleMatch = p.title.toLowerCase().includes(q);
      const categoryMatch = p.category.toLowerCase().includes(q);
      const skillMatch = p.requiredSkills?.some((s) => s.name.toLowerCase().includes(q));
      const matchedSkillMatch = rec.matchedSkills?.some((s) => s.name.toLowerCase().includes(q));
      const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || categoryMatch || skillMatch || matchedSkillMatch || tagMatch;
    });
  }, [recommendations, searchQuery]);

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Page Header: Where am I? What can I do here? What should I do next? */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Project Recommendations' },
        ]}
        badge="Deterministic Matching Algorithm"
        badgeIcon={Sparkles}
        title="Skill-to-Project Recommendations"
        description="Projects ranked for your profile using transparent weighted compatibility: Required Skills (40%), Domain Interests (20%), Difficulty (15%), Career Goal (15%), and Evidence (10%)."
        studentTip="Projects marked 'Ready to Build' match your existing skills. 'Needs Preparation' shows the exact technologies you can master first through Peer Exchange!"
        actions={
          <>
            <Link to="/projects">
              <Button variant="outline" size="sm" icon={FolderGit2}>
                All Projects
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchRecommendations}
              icon={RefreshCw}
              disabled={isLoading}
            >
              Refresh Scores
            </Button>
          </>
        }
      />

      {/* Error alert */}
      {error && (
        <FeedbackAlert
          type="error"
          message={error}
          onDismiss={() => setError('')}
        />
      )}

      {/* User Profile Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Target className="w-4 h-4 text-brand-400" />
            <span>Target Role: <strong className="text-brand-300">{user?.targetRole || 'Full Stack Engineer'}</strong></span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Profile Skills: <strong className="text-purple-300">{userProfile?.teachSkillsCount || 'Active'}</strong></span>
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>College: <strong className="text-emerald-300">{user?.college || 'Campus Member'}</strong></span>
          </span>
        </div>

        <Link
          to="/skills"
          className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold"
        >
          <span>Manage Skills</span>
          <Sparkles className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Summary KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Ready to Build"
            value={stats.readyToBuildCount}
            subtext="100% stack matched"
            icon={CheckCircle2}
            iconBg="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            onClick={() => setActiveReadinessTab('READY_TO_BUILD')}
            className={activeReadinessTab === 'READY_TO_BUILD' ? 'border-emerald-500/40 bg-emerald-950/20' : ''}
          />

          <StatCard
            label="Needs Preparation"
            value={stats.needsPreparationCount}
            subtext="Small skill gaps to bridge"
            icon={AlertTriangle}
            iconBg="bg-amber-500/10 border-amber-500/20 text-amber-400"
            onClick={() => setActiveReadinessTab('NEEDS_PREPARATION')}
            className={activeReadinessTab === 'NEEDS_PREPARATION' ? 'border-amber-500/40 bg-amber-950/20' : ''}
          />

          <StatCard
            label="Stretch Goals"
            value={stats.stretchProjectCount}
            subtext="High-growth challenges"
            icon={TrendingUp}
            iconBg="bg-purple-500/10 border-purple-500/20 text-purple-400"
            onClick={() => setActiveReadinessTab('STRETCH_PROJECT')}
            className={activeReadinessTab === 'STRETCH_PROJECT' ? 'border-purple-500/40 bg-purple-950/20' : ''}
          />

          <StatCard
            label="Top Match Score"
            value={`${stats.topMatchScore}%`}
            subtext={`Across ${stats.totalProjectsEvaluated} evaluated`}
            icon={Sparkles}
            iconBg="bg-brand-500/10 border-brand-500/20 text-brand-400"
          />
        </div>
      )}

      {/* 3. Filter and Readiness Tabs Bar */}
      <div className="space-y-4">
        {/* Readiness Status Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          {READINESS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeReadinessTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReadinessTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tab.color}`} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls: Search, Category, Min Score */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          {/* Keyword Search */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by project, skill (e.g. React, Docker), or tag..."
              ariaLabel="Search recommendations"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Domains / Categories</option>
              {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Difficulty Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            {/* Min Score Dropdown */}
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              aria-label="Filter by minimum score"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value={0}>Any Match Score</option>
              <option value={60}>60%+ Match</option>
              <option value={70}>70%+ Match</option>
              <option value={80}>80%+ Top Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Recommendations Feed */}
      {isLoading ? (
        <LoadingState rows={3} message="Evaluating 15+ engineering projects against your profile..." />
      ) : filteredRecommendations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No matching projects found"
          description="No projects currently match your filter criteria or minimum score threshold. Try adjusting your filters or adding new skills to your profile to expand recommendations."
          actionLabel="Reset All Filters"
          onAction={() => {
            setActiveReadinessTab('ALL');
            setSelectedCategory('ALL');
            setSelectedDifficulty('ALL');
            setMinScore(0);
            setSearchQuery('');
          }}
          secondaryAction={
            <Link to="/skills">
              <Button variant="primary" size="sm">
                Add More Skills
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredRecommendations.length}</strong> prioritized projects
            </span>
            <span>Sorted descending by multi-factor score</span>
          </div>

          <div className="space-y-5">
            {filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.project._id}
                recommendation={rec}
                onViewDetails={(p) => setDetailProject(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {detailProject && (
        <ProjectDetailModal
          isOpen={!!detailProject}
          onClose={() => setDetailProject(null)}
          project={detailProject}
          currentUserId={user?._id}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
};

export default RecommendedProjectsPage;
