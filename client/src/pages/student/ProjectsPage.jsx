import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { LoadingState } from '../../components/common/LoadingState';
import * as projectApi from '../../services/projectApi';
import * as skillApi from '../../services/skillApi';

// Project Components
import ProjectCard from '../../components/projects/ProjectCard';
import ProjectDetailModal from '../../components/projects/ProjectDetailModal';
import ProjectFormModal from '../../components/projects/ProjectFormModal';
import DeleteProjectModal from '../../components/projects/DeleteProjectModal';

import {
  FolderGit2,
  Plus,
  RefreshCw,
  Layers,
  Sparkles,
  Globe,
  Cpu,
  Database,
  Smartphone,
  Cloud,
  Shield,
  SlidersHorizontal,
  Filter
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

const DIFFICULTIES = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const ProjectsPage = () => {
  const { user } = useAuth();

  // State
  const [projects, setProjects] = useState([]);
  const [canonicalSkills, setCanonicalSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [showMyProjectsOnly, setShowMyProjectsOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Modals State
  const [detailProject, setDetailProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  // Load Data
  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (showMyProjectsOnly) params.creator = 'me';
      params.sort = sortBy;
      params.limit = 50;

      const [projectsRes, skillsRes] = await Promise.all([
        projectApi.getProjects(params),
        skillApi.getSkills(),
      ]);

      setProjects(projectsRes.data || []);
      setCanonicalSkills(skillsRes.data?.skills || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load project catalog.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedCategory, selectedDifficulty, showMyProjectsOnly, sortBy]);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    loadProjects();
  };

  const showNotification = (msg, type = 'success') => {
    setFeedback({ type, message: msg });
  };

  // Handlers for Project CRUD
  const handleCreateProject = async (formData) => {
    const res = await projectApi.createProject(formData);
    showNotification('Project created successfully!');
    await loadProjects();
    return res;
  };

  const handleUpdateProject = async (formData) => {
    if (!editingProject) return;
    const res = await projectApi.updateProject(editingProject._id, formData);
    showNotification('Project updated successfully!');
    setEditingProject(null);
    await loadProjects();
    return res;
  };

  const handleDeleteProject = async (projectId) => {
    await projectApi.deleteProject(projectId);
    showNotification('Project deleted successfully.');
    await loadProjects();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDifficulty('ALL');
    setShowMyProjectsOnly(false);
    setSortBy('newest');
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Web Development':
        return Globe;
      case 'AI':
        return Cpu;
      case 'Data Science':
        return Database;
      case 'Mobile':
        return Smartphone;
      case 'Cloud':
        return Cloud;
      case 'Cybersecurity':
        return Shield;
      default:
        return Layers;
    }
  };

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Page Header: Where am I? What can I do here? What should I do next? */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Project Catalog' },
        ]}
        badge="Engineering Innovation Lab"
        badgeIcon={FolderGit2}
        title="Engineering Project Catalog"
        description="Browse curriculum and industry-standard projects across Web, AI, Data Science, Mobile, Cloud, and Cybersecurity. Join teams or launch your own project workspace."
        studentTip="Looking for projects tailored to your existing skills? Visit the Recommendations page to see multi-factor compatibility scores!"
        actions={
          <>
            <Link to="/recommendations">
              <Button
                variant="brand"
                size="sm"
                icon={Sparkles}
                className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 border-0"
              >
                Recommended For Me
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              isLoading={isLoading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
            >
              Propose Project
            </Button>
          </>
        }
      />

      {/* Notifications */}
      {feedback && (
        <FeedbackAlert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat);
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat === 'ALL' ? 'All Domains' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Refinement Controls */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => {
              setSearchQuery('');
              loadProjects();
            }}
            placeholder="Search projects by title, description, skills, or tags..."
            ariaLabel="Search project specifications"
            className="flex-1"
          />

          <Button type="submit" variant="secondary" size="sm" icon={SlidersHorizontal}>
            Apply Search
          </Button>
        </form>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Difficulty:
              </span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff === 'ALL' ? 'All Difficulties' : diff}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort projects"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>

            {/* My Projects Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showMyProjectsOnly}
                onChange={(e) => setShowMyProjectsOnly(e.target.checked)}
                className="rounded border-slate-800 text-brand-500 focus:ring-brand-500/20 bg-slate-950"
              />
              <span>My Projects Only</span>
            </label>
          </div>

          <div className="text-slate-400 font-medium">
            Showing <strong className="text-white">{projects.length}</strong> project specifications
          </div>
        </div>
      </div>

      {/* 4. Projects Grid */}
      {isLoading ? (
        <LoadingState rows={6} message="Loading project specifications..." />
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              currentUserId={user?._id}
              onViewDetails={(p) => setDetailProject(p)}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="No project specifications matched your search and filter criteria. You can clear your filters or be the first to propose this project idea!"
          actionLabel="Reset All Filters"
          onAction={resetFilters}
          secondaryAction={
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Propose New Project
            </Button>
          }
        />
      )}

      {/* MODAL 1: View Project Details */}
      <ProjectDetailModal
        isOpen={!!detailProject}
        onClose={() => setDetailProject(null)}
        project={detailProject}
        currentUserId={user?._id}
        onEdit={(p) => setEditingProject(p)}
        onDelete={(p) => setDeletingProject(p)}
      />

      {/* MODAL 2: Create Project Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        initialData={null}
        availableSkills={canonicalSkills}
      />

      {/* MODAL 3: Edit Project Modal */}
      <ProjectFormModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={handleUpdateProject}
        initialData={editingProject}
        availableSkills={canonicalSkills}
      />

      {/* MODAL 4: Delete Confirmation */}
      <DeleteProjectModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};

export default ProjectsPage;
