import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { StatCard } from '../../components/common/StatCard';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { LoadingState } from '../../components/common/LoadingState';
import * as authApi from '../../services/authApi';
import * as skillApi from '../../services/skillApi';
import * as exchangeApi from '../../services/exchangeApi';
import * as projectApi from '../../services/projectApi';
import * as collaborationApi from '../../services/collaborationApi';
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Layers,
  ArrowRight,
  Repeat,
  Plus,
  Calendar,
  Users,
  FolderGit2,
  Check,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  Activity,
  Code2,
  Compass,
  Lightbulb
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [userSkills, setUserSkills] = useState({ teach: [], learn: [] });
  const [exchangeStats, setExchangeStats] = useState({
    matches: [],
    requests: { incoming: [], outgoing: [] },
    sessions: []
  });
  const [projectCount, setProjectCount] = useState(0);
  const [recommendedPreview, setRecommendedPreview] = useState([]);
  const [collabData, setCollabData] = useState({ invitesReceived: [], joinRequestsSent: [] });

  // Developer inspector toggle
  const [showDevInspector, setShowDevInspector] = useState(false);
  const [protectedEndpointData, setProtectedEndpointData] = useState(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [
          healthRes,
          skillsRes,
          matchesRes,
          requestsRes,
          sessionsRes,
          projectsRes,
          recRes,
          collabRes
        ] = await Promise.allSettled([
          authApi.checkHealth(),
          skillApi.getUserSkills(),
          exchangeApi.getMatches(),
          exchangeApi.getRequests(),
          exchangeApi.getSessions(),
          projectApi.getProjects({ limit: 1 }),
          projectApi.getRecommendedProjects({ limit: 3 }),
          collaborationApi.getMyCollaborationRequests(),
        ]);

        if (healthRes.status === 'fulfilled') setHealthStatus(healthRes.value.data);
        if (skillsRes.status === 'fulfilled') setUserSkills(skillsRes.value.data || { teach: [], learn: [] });

        setExchangeStats({
          matches:
            matchesRes.status === 'fulfilled'
              ? matchesRes.value.data?.matches || []
              : [],

          requests:
            requestsRes.status === 'fulfilled'
              ? requestsRes.value.data || { incoming: [], outgoing: [] }
              : { incoming: [], outgoing: [] },

          sessions:
            sessionsRes.status === 'fulfilled'
              ? sessionsRes.value.data?.sessions || []
              : [],
        });

        if (projectsRes.status === 'fulfilled') {
          setProjectCount(projectsRes.value.pagination?.total || projectsRes.value.data?.length || 0);
        }

        if (recRes.status === 'fulfilled') {
          setRecommendedPreview(recRes.value.data?.slice(0, 2) || []);
        }

        if (collabRes.status === 'fulfilled') {
          setCollabData(collabRes.value.data?.data || { invitesReceived: [], joinRequestsSent: [] });
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setFeedback({ type: 'error', message: 'Some dashboard widgets could not be loaded.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRespondInvite = async (requestId, action) => {
    try {
      await collaborationApi.respondToCollaborationRequest(requestId, { action });
      const updated = await collaborationApi.getMyCollaborationRequests();
      setCollabData(updated.data?.data || { invitesReceived: [], joinRequestsSent: [] });
      setFeedback({
        type: 'success',
        message: action === 'ACCEPT'
          ? 'You have successfully joined the project team! Check your project workspace.'
          : 'Invitation declined.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to respond to invitation.' });
    }
  };

  const handleTestProtectedEndpoint = async () => {
    setIsLoadingTest(true);
    try {
      const res = await authApi.getMe();
      setProtectedEndpointData(res);
    } catch (err) {
      setProtectedEndpointData({ error: err.message });
    } finally {
      setIsLoadingTest(false);
    }
  };

  const pendingInvites = (collabData.invitesReceived || []).filter((i) => i.status === 'PENDING');
  const upcomingSessions = (exchangeStats.sessions || []).filter((s) => s.status === 'SCHEDULED');
  const teachCount = userSkills.teach?.length || 0;
  const learnCount = userSkills.learn?.length || 0;
  const verifiedCount = userSkills.teach?.filter((s) => s.isVerified)?.length || 0;
  const matchCount = exchangeStats.matches?.length || 0;

  // Calculate student profile completeness score
  let profileScore = 25; // Basic registration
  if (user?.college && user?.branch) profileScore += 25;
  if (teachCount > 0 || learnCount > 0) profileScore += 25;
  if (verifiedCount > 0 || exchangeStats.sessions?.length > 0) profileScore += 25;

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <FeedbackAlert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* 1. Student Orientation Hero Banner: "Where am I?" */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/40 border border-brand-500/20 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar name={user?.name || 'Student'} src={user?.profileImage} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Welcome, {user?.name || 'Student'}!
                </h1>
                <Badge variant="brand" size="xs">
                  {user?.role || 'STUDENT'}
                </Badge>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5 text-brand-300 font-medium">
                  <GraduationCap className="w-4 h-4 text-brand-400" />
                  {user?.college || 'Campus Member'} ({user?.branch || 'CS'} '{user?.graduationYear || 2026})
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  Target: {user?.targetRole || 'Full Stack Engineer'}
                </span>
              </div>

              {/* Profile completeness progress */}
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="w-32 sm:w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {profileScore}% Profile Strength
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
            <Link to="/skills">
              <Button variant="primary" size="sm" icon={Plus}>
                Add Skills
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button variant="secondary" size="sm" icon={Sparkles}>
                Recommended Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Critical Actionable Alerts (Pending Team Invites or Upcoming Sessions) */}
      {pendingInvites.length > 0 && (
        <Card className="p-4 sm:p-5 border-emerald-500/30 bg-emerald-950/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Mail className="w-5 h-5 shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
              Action Required: Project Collaboration Invitation ({pendingInvites.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {pendingInvites.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={inv.senderId?.name} src={inv.senderId?.profileImage} size="sm" />
                  <div>
                    <div className="text-slate-200">
                      <strong className="text-white font-semibold">{inv.senderId?.name}</strong> invited you to join{' '}
                      <strong className="text-brand-300">{inv.projectId?.title}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned Role: <span className="text-purple-300 font-semibold">{inv.role}</span>
                      {inv.message && ` • "${inv.message}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="xs"
                    icon={Check}
                    onClick={() => handleRespondInvite(inv._id, 'ACCEPT')}
                  >
                    Accept & Join Team
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={X}
                    className="text-rose-400 hover:bg-rose-500/10"
                    onClick={() => handleRespondInvite(inv._id, 'REJECT')}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Session Notification */}
      {upcomingSessions.length > 0 && (
        <Card className="p-4 sm:p-5 border-brand-500/30 bg-brand-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">Upcoming Session</span>
                <Badge variant="brand" size="xs">Scheduled</Badge>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                {upcomingSessions[0]?.topic || 'Learning Session'} with {upcomingSessions[0]?.teacherId?.name || 'Peer Mentor'}
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(upcomingSessions[0]?.scheduledDate).toLocaleString()}
              </p>
            </div>
          </div>

          <Link to="/skill-exchange" className="shrink-0">
            <Button variant="secondary" size="xs" icon={ArrowRight}>
              Open Exchange Hub
            </Button>
          </Link>
        </Card>
      )}

      {/* 3. Five-Second Scannable Metric Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Campus Activity Snapshot
          </h2>
          <span className="text-[11px] text-slate-500">Live data</span>
        </div>

        {isLoading ? (
          <LoadingState rows={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: My Skills */}
            <StatCard
              label="My Skill Inventory"
              value={`${teachCount} Teach • ${learnCount} Learn`}
              subtext={`${verifiedCount} verified with project proof`}
              icon={Layers}
              iconBg="bg-brand-500/10 border-brand-500/20 text-brand-400"
              actionLabel="Manage"
              actionTo="/skills"
            />

            {/* Card 2: Peer Mentors */}
            <StatCard
              label="Peer Exchange"
              value={`${matchCount} Matches`}
              subtext={matchCount > 0 ? 'Compatible peer mentors found' : 'Add skills to find mentors'}
              icon={Repeat}
              iconBg="bg-purple-500/10 border-purple-500/20 text-purple-400"
              actionLabel="Exchange"
              actionTo="/skill-exchange"
            />

            {/* Card 3: Project Catalog */}
            <StatCard
              label="Project Catalog"
              value={`${projectCount} Projects`}
              subtext="Web, AI, Mobile, Cloud, Security"
              icon={FolderGit2}
              iconBg="bg-blue-500/10 border-blue-500/20 text-blue-400"
              actionLabel="Explore"
              actionTo="/projects"
            />

            {/* Card 4: Recommended Projects */}
            <StatCard
              label="Curated Matches"
              value="Smart Scored"
              subtext="Tailored to your current skills"
              icon={Sparkles}
              iconBg="bg-amber-500/10 border-amber-500/20 text-amber-400"
              actionLabel="Recommendations"
              actionTo="/recommendations"
            />
          </div>
        )}
      </div>

      {/* 4. "What Should I Do Next?" - Student 3-Step Guided Roadmap */}
      <Card className="p-5 sm:p-6 border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Recommended Next Steps for You
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Follow this path to accelerate your portfolio
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className={`p-4 rounded-xl border transition-all ${teachCount > 0 && learnCount > 0
            ? 'bg-emerald-950/15 border-emerald-500/30'
            : 'bg-slate-950 border-slate-800'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Step 1: Skills Matrix
              </span>
              {teachCount > 0 && learnCount > 0 ? (
                <Badge variant="success" size="xs">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </Badge>
              ) : (
                <Badge variant="warning" size="xs">Incomplete</Badge>
              )}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Add Your Skills
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              List the technologies you can teach and what you want to learn next.
            </p>
            <Link to="/skills">
              <Button variant="outline" size="xs" className="w-full justify-center">
                {teachCount > 0 ? 'Edit Skills' : 'Add First Skill'}
              </Button>
            </Link>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xl border transition-all ${exchangeStats.sessions?.length > 0
            ? 'bg-emerald-950/15 border-emerald-500/30'
            : 'bg-slate-950 border-slate-800'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Step 2: Mentorship
              </span>
              {exchangeStats.sessions?.length > 0 ? (
                <Badge variant="success" size="xs">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </Badge>
              ) : (
                <Badge variant="brand" size="xs">Next Action</Badge>
              )}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Exchange Knowledge
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Connect with fellow students for 1-on-1 bilateral learning sessions.
            </p>
            <Link to="/skill-exchange">
              <Button variant="outline" size="xs" className="w-full justify-center">
                Browse Peer Matches
              </Button>
            </Link>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xl border transition-all ${verifiedCount > 0
            ? 'bg-emerald-950/15 border-emerald-500/30'
            : 'bg-slate-950 border-slate-800'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Step 3: Verification
              </span>
              {verifiedCount > 0 ? (
                <Badge variant="success" size="xs">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </Badge>
              ) : (
                <Badge variant="default" size="xs">Goal</Badge>
              )}
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Build & Earn Evidence
            </h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Complete project milestones in your workspace to attach verified evidence to your skills.
            </p>
            <Link to="/recommendations">
              <Button variant="outline" size="xs" className="w-full justify-center">
                Find Fit Projects
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 5. Recommended Projects Preview */}
      {recommendedPreview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Recommended Projects For You
              </h2>
              <p className="text-xs text-slate-400">
                Curated based on your skill compatibility and learning goals
              </p>
            </div>
            <Link to="/recommendations">
              <Button variant="ghost" size="xs" icon={ArrowRight}>
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedPreview.map((rec) => (
              <Card key={rec.project._id} className="p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                      {rec.project.category}
                    </span>
                    <Badge variant={rec.readinessStatus === 'READY_TO_BUILD' ? 'success' : 'warning'} size="xs">
                      {rec.readinessStatus === 'READY_TO_BUILD' ? 'Ready to Build' : 'Needs Preparation'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {rec.project.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {rec.project.tagline || rec.project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(rec.matchedSkills || []).slice(0, 3).map((s) => (
                      <span key={s.skillId} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                        ✓ {s.name}
                      </span>
                    ))}
                    {(rec.missingSkills || []).slice(0, 2).map((s) => (
                      <span key={s.skillId} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        + {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">
                    Match Score: <strong className="text-brand-300">{rec.score}%</strong>
                  </span>
                  <Link to="/recommendations">
                    <Button variant="primary" size="xs" icon={ArrowRight}>
                      View Recommendation
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. Collapsible Developer & Health Inspector (Preserves Phase 1-2 Tests & Transparency) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDevInspector(!showDevInspector)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors py-2"
        >
          <Code2 className="w-4 h-4" />
          <span>System Health & API Verification Inspector</span>
          {showDevInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDevInspector && (
          <Card className="mt-2 p-5 border-slate-800 bg-slate-950 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  MongoDB Connection & JWT State
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Database status: <strong className="text-emerald-400">{healthStatus?.status || 'Online'}</strong> •
                  Environment: <strong className="text-brand-400">{healthStatus?.environment || 'development'}</strong>
                </p>
              </div>

              <Button
                variant="secondary"
                size="xs"
                onClick={handleTestProtectedEndpoint}
                isLoading={isLoadingTest}
                icon={Activity}
              >
                Invoke GET /api/auth/me
              </Button>
            </div>

            {protectedEndpointData && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                <pre>{JSON.stringify(protectedEndpointData, null, 2)}</pre>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
