import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import * as authApi from '../../services/authApi';
import * as skillApi from '../../services/skillApi';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Globe, 
  CheckCircle2, 
  Save, 
  Code2,
  Share2,
  Sparkles,
  Repeat,
  Eye,
  Edit3
} from 'lucide-react';

const AVATAR_PRESETS = [
  'AlexRivera',
  'PriyaPatel',
  'CyberKnight',
  'CodeNinja',
  'QuantumDev',
  'PixelMaster',
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || 2026,
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    targetRole: user?.targetRole || 'Full Stack Developer',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    portfolio: user?.socialLinks?.portfolio || '',
  });

  const [userSkills, setUserSkills] = useState({ teach: [], learn: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await skillApi.getUserSkills();
        setUserSkills(res.data || { teach: [], learn: [] });
      } catch (err) {
        console.error('Failed to load profile skills:', err);
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value, 10) || '' : value,
    }));
    setFeedback(null);
  };

  const handleSelectPresetAvatar = (seed) => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
    setFormData((prev) => ({ ...prev, profileImage: avatarUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        graduationYear: parseInt(formData.graduationYear, 10),
        profileImage: formData.profileImage.trim(),
        bio: formData.bio.trim(),
        targetRole: formData.targetRole.trim(),
        socialLinks: {
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          portfolio: formData.portfolio.trim(),
        },
      };

      const res = await authApi.updateProfile(payload);
      if (res?.data?.user) {
        updateUser(res.data.user);
        setFeedback({ type: 'success', message: 'Profile details successfully updated!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Page Header: Where am I? What can I do here? What should I do next? */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Profile' },
        ]}
        badge="Campus Student Card"
        badgeIcon={User}
        title="Student Developer Profile"
        description="Manage your academic background, career trajectory, avatar, and portfolio links. Your profile is visible to peers during skill exchange and team invitations."
        studentTip="Keeping your Target Role updated helps SkillForge recommend the highest-impact projects for your career goals!"
        actions={
          <Button
            variant={previewMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            icon={previewMode ? Edit3 : Eye}
          >
            {previewMode ? 'Back to Editor' : 'Preview Public Card'}
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

      {/* Top Identity Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <Avatar name={formData.name || 'User'} src={formData.profileImage} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{formData.name}</h2>
              <Badge variant="brand" size="xs">{user?.role || 'STUDENT'}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-xs text-brand-400 mt-1 font-medium">
              {formData.college} • {formData.branch} ('{formData.graduationYear})
            </p>
          </div>
        </div>
      </div>

      {previewMode ? (
        /* Public Profile Preview Mode */
        <div className="space-y-6">
          <Card className="border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">About Me</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {formData.bio || 'No bio provided yet. Add a short bio describing your technical journey and learning goals.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
              {formData.github && (
                <a href={formData.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline">
                  <Code2 className="w-4 h-4" /> GitHub Profile
                </a>
              )}
              {formData.linkedin && (
                <a href={formData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline">
                  <Share2 className="w-4 h-4" /> LinkedIn Profile
                </a>
              )}
              {formData.portfolio && (
                <a href={formData.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-400 hover:underline">
                  <Globe className="w-4 h-4" /> Personal Portfolio
                </a>
              )}
            </div>
          </Card>

          {/* Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                Skills I Can Teach ({userSkills.teach.length})
              </h3>
              <div className="space-y-2.5">
                {userSkills.teach.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{item.skillId?.name}</span>
                      <Badge variant="brand" size="xs">{item.level}</Badge>
                    </div>
                    {item.evidence?.length > 0 && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified: {item.evidence[0].projectName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-400" />
                Skills I Want to Learn ({userSkills.learn.length})
              </h3>
              <div className="space-y-2.5">
                {userSkills.learn.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{item.skillId?.name}</span>
                    <Badge variant="purple" size="xs">Goal: Master</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Edit Profile Form */
        <Card className="border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Your Avatar Preset
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(preset)}`;
                  const isSelected = formData.profileImage === url;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(preset)}
                      className={`relative rounded-full p-0.5 border-2 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        isSelected ? 'border-brand-500 shadow-md shadow-brand-500/30' : 'border-transparent'
                      }`}
                    >
                      <Avatar name={preset} src={url} size="md" />
                    </button>
                  );
                })}
              </div>
              <Input
                label="Or Custom Image URL"
                name="profileImage"
                placeholder="https://..."
                value={formData.profileImage}
                onChange={handleChange}
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Personal & Academic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="College / University"
                  name="college"
                  icon={GraduationCap}
                  value={formData.college}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Branch / Major"
                  name="branch"
                  icon={BookOpen}
                  value={formData.branch}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Graduation Year"
                  name="graduationYear"
                  type="number"
                  min="2000"
                  max="2035"
                  icon={Calendar}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Target Engineering Role"
                name="targetRole"
                icon={Briefcase}
                placeholder="e.g. Full Stack Developer, Distributed Systems Engineer"
                value={formData.targetRole}
                onChange={handleChange}
                helperText="Used to match appropriate project specifications and skill roadmaps."
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Bio / About Me
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share your technical interests, coding journey, and what you are looking to build..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="border-t border-slate-800 pt-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Social Profiles & Portfolio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="GitHub URL"
                  name="github"
                  icon={Code2}
                  placeholder="https://github.com/..."
                  value={formData.github}
                  onChange={handleChange}
                />
                <Input
                  label="LinkedIn URL"
                  name="linkedin"
                  icon={Share2}
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedin}
                  onChange={handleChange}
                />
                <Input
                  label="Personal Portfolio"
                  name="portfolio"
                  icon={Globe}
                  placeholder="https://..."
                  value={formData.portfolio}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                icon={Save}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
