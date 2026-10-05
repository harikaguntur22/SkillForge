import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { SearchBar } from '../../components/common/SearchBar';
import SkillCard from '../../components/skills/SkillCard';
import AddSkillModal from '../../components/skills/AddSkillModal';
import AddEvidenceModal from '../../components/skills/AddEvidenceModal';
import * as skillApi from '../../services/skillApi';
import { 
  GraduationCap, 
  Repeat, 
  Plus, 
  CheckCircle2, 
  Briefcase, 
  Layers, 
  Sparkles
} from 'lucide-react';

export const SkillsPage = () => {
  const [skills, setSkills] = useState({ teach: [], learn: [] });
  const [activeTab, setActiveTab] = useState('TEACH');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState('TEACH');
  const [evidenceModalSkill, setEvidenceModalSkill] = useState(null);

  const fetchUserSkills = async () => {
    setIsLoading(true);
    try {
      const res = await skillApi.getUserSkills();
      setSkills(res?.data || { teach: [], learn: [] });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load user skills.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  const handleAddSkill = async (payload) => {
    try {
      const res = await skillApi.addUserSkill(payload);
      await fetchUserSkills();
      setFeedback({
        type: 'success',
        message: `Successfully added ${res.data.userSkill.skillId.name} to your ${payload.type === 'TEACH' ? 'Skills I Can Teach' : 'Skills I Want to Learn'} list!`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add skill.' });
    }
  };

  const handleUpdateLevel = async (userSkillId, updateData) => {
    try {
      await skillApi.updateUserSkill(userSkillId, updateData);
      await fetchUserSkills();
      setFeedback({ type: 'success', message: 'Skill proficiency level updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update level.' });
    }
  };

  const handleDeleteSkill = async (userSkillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) return;
    try {
      await skillApi.deleteUserSkill(userSkillId);
      await fetchUserSkills();
      setFeedback({ type: 'success', message: 'Skill removed from profile.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove skill.' });
    }
  };

  const handleAddEvidence = async (userSkillId, evidenceData) => {
    try {
      await skillApi.addEvidence(userSkillId, evidenceData);
      await fetchUserSkills();
      setFeedback({ type: 'success', message: 'Project evidence attached successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to attach evidence.' });
    }
  };

  const handleDeleteEvidence = async (userSkillId, evidenceId) => {
    if (!window.confirm('Delete this project proof item?')) return;
    try {
      await skillApi.deleteEvidence(userSkillId, evidenceId);
      await fetchUserSkills();
      setFeedback({ type: 'success', message: 'Evidence removed.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove evidence.' });
    }
  };

  // Filter skills by tab, search, and category
  const activeList = activeTab === 'TEACH' ? skills.teach : skills.learn;

  const filteredList = activeList.filter((item) => {
    const s = item.skillId || {};
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate statistics
  const totalTeach = skills.teach.length;
  const totalLearn = skills.learn.length;
  const totalEvidence = skills.teach.reduce((acc, curr) => acc + (curr.evidence?.length || 0), 0);
  const totalVerified = skills.teach.filter((s) => s.isVerified).length;

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Page Header: Where am I? What can I do here? What should I do next? */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Skills' },
        ]}
        badge="Campus Knowledge Matrix"
        badgeIcon={Sparkles}
        title="My Skills & Verified Evidence"
        description="Specify the technologies you can teach to fellow students and the skills you are actively working to master. Your skills power smart recommendations and peer mentorship."
        studentTip="Attach project repositories and demo links as evidence to earn the 'Verified' badge for higher peer matching scores!"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setModalDefaultType(activeTab);
              setIsAddSkillModalOpen(true);
            }}
            icon={Plus}
          >
            Add New Skill
          </Button>
        }
      />

      {/* Feedback Banner */}
      {feedback && (
        <FeedbackAlert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Can Teach"
          value={totalTeach}
          subtext="Mentor-ready technologies"
          icon={GraduationCap}
          iconBg="bg-brand-500/10 border-brand-500/20 text-brand-400"
          onClick={() => setActiveTab('TEACH')}
          className={activeTab === 'TEACH' ? 'border-brand-500/40 bg-brand-950/20' : ''}
        />
        <StatCard
          label="Want to Learn"
          value={totalLearn}
          subtext="Active learning targets"
          icon={Repeat}
          iconBg="bg-purple-500/10 border-purple-500/20 text-purple-400"
          onClick={() => setActiveTab('LEARN')}
          className={activeTab === 'LEARN' ? 'border-purple-500/40 bg-purple-950/20' : ''}
        />
        <StatCard
          label="Project Evidence"
          value={totalEvidence}
          subtext="Linked portfolio projects"
          icon={Briefcase}
          iconBg="bg-blue-500/10 border-blue-500/20 text-blue-400"
        />
        <StatCard
          label="Verified Skills"
          value={totalVerified}
          subtext="Backed with project proof"
          icon={CheckCircle2}
          iconBg="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
      </div>

      {/* 3. Tabs and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('TEACH')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'TEACH'
                  ? 'bg-brand-500/15 border border-brand-500/30 text-brand-300 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Skills I Can Teach</span>
              <Badge variant="brand" size="xs">{totalTeach}</Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LEARN')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'LEARN'
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Skills I Want to Learn</span>
              <Badge variant="purple" size="xs">{totalLearn}</Badge>
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={`Filter ${activeTab === 'TEACH' ? 'teaching' : 'learning'} skills...`}
              ariaLabel="Filter skills"
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <LoadingState rows={6} message="Loading your skill inventory..." />
        ) : filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((userSkill) => (
              <SkillCard
                key={userSkill._id}
                userSkill={userSkill}
                onUpdateLevel={handleUpdateLevel}
                onDeleteSkill={handleDeleteSkill}
                onOpenAddEvidence={(s) => setEvidenceModalSkill(s)}
                onDeleteEvidence={handleDeleteEvidence}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Layers}
            title={
              search 
                ? 'No matching skills found' 
                : activeTab === 'TEACH' 
                ? 'No teaching skills added yet' 
                : 'No target skills to learn yet'
            }
            description={
              search
                ? `No skills matched "${search}". Try searching for another technology or clear the filter.`
                : activeTab === 'TEACH'
                ? 'Add languages, frameworks, or tools you are comfortable with. Fellow students will be able to request mentorship sessions from you!'
                : 'Add skills you want to learn so SkillForge can recommend compatible student mentors and projects tailored to your growth goals.'
            }
            actionLabel={search ? 'Clear Search' : 'Add First Skill'}
            actionIcon={search ? undefined : Plus}
            onAction={() => {
              if (search) {
                setSearch('');
              } else {
                setModalDefaultType(activeTab);
                setIsAddSkillModalOpen(true);
              }
            }}
          />
        )}
      </div>

      {/* Modals */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        defaultType={modalDefaultType}
        onSkillAdded={handleAddSkill}
      />

      <AddEvidenceModal
        isOpen={!!evidenceModalSkill}
        userSkill={evidenceModalSkill}
        onClose={() => setEvidenceModalSkill(null)}
        onEvidenceAdded={handleAddEvidence}
      />
    </div>
  );
};

export default SkillsPage;
