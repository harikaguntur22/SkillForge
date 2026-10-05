import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { LoadingState } from '../../components/common/LoadingState';
import { Link } from 'react-router-dom';
import * as exchangeApi from '../../services/exchangeApi';

// Reusable Exchange Components
import PeerMatchCard from '../../components/exchange/PeerMatchCard';
import ExchangeRequestCard from '../../components/exchange/ExchangeRequestCard';
import SessionCard from '../../components/exchange/SessionCard';
import RequestExchangeModal from '../../components/exchange/RequestExchangeModal';
import ScheduleSessionModal from '../../components/exchange/ScheduleSessionModal';
import SessionFeedbackModal from '../../components/exchange/SessionFeedbackModal';

import {
  Sparkles,
  Repeat,
  Calendar,
  Inbox,
  Send,
  Filter,
  Layers,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';

export const SkillExchangePage = () => {
  const { user } = useAuth();

  // Tab State: 'matches' | 'requests' | 'sessions'
  const [activeTab, setActiveTab] = useState('matches');

  // Sub-tab for requests: 'incoming' | 'outgoing'
  const [requestTab, setRequestTab] = useState('incoming');

  // Sub-tab for sessions: 'upcoming' | 'completed'
  const [sessionTab, setSessionTab] = useState('upcoming');

  // Data State
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'MUTUAL' | 'MENTOR'

  // Modals
  const [selectedMatchForRequest, setSelectedMatchForRequest] = useState(null);
  const [selectedRequestForSchedule, setSelectedRequestForSchedule] = useState(null);
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState(null);

  // Load All Exchange Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [matchesRes, requestsRes, sessionsRes] = await Promise.all([
        exchangeApi.getMatches(),
        exchangeApi.getRequests(),
        exchangeApi.getSessions(),
      ]);

      setMatches(matchesRes.data?.matches || []);

      setRequests(
        requestsRes.data || {
          incoming: [],
          outgoing: [],
        }
      );

      setSessions(sessionsRes.data?.sessions || []);
    } catch (err) {
      console.error('Failed to load exchange data:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load skill exchange data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ type, message: msg });
  };

  // Handlers for Request Creation
  const handleSendExchangeRequest = async (payload) => {
    const res = await exchangeApi.sendRequest(payload);
    showNotification('Exchange request sent successfully! You will be notified when they accept.');
    await loadData();
    return res;
  };

  // Handlers for Request Status Transitions
  const handleAcceptRequest = async (requestId) => {
    try {
      await exchangeApi.updateRequestStatus(requestId, 'ACCEPTED');
      showNotification('Exchange request accepted! You can now schedule 1-on-1 learning sessions.');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to accept request.', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await exchangeApi.updateRequestStatus(requestId, 'REJECTED');
      showNotification('Exchange request declined.', 'info');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to decline request.', 'error');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await exchangeApi.updateRequestStatus(requestId, 'CANCELLED');
      showNotification('Exchange request cancelled.', 'info');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to cancel request.', 'error');
    }
  };

  // Handlers for Sessions
  const handleSessionScheduled = async (payload) => {
    const res = await exchangeApi.scheduleSession(payload);
    showNotification('Learning session successfully scheduled! Check your Sessions tab.');
    await loadData();
    setActiveTab('sessions');
    setSessionTab('upcoming');
    return res;
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await exchangeApi.updateSessionStatus(sessionId, 'COMPLETED');
      showNotification('Session marked as completed! Please share your feedback and rating.');
      await loadData();
    } catch (err) {
      showNotification(err.message || 'Failed to complete session.', 'error');
    }
  };

  const handleSubmitFeedback = async (sessionId, feedbackPayload) => {
    const res = await exchangeApi.submitFeedback(sessionId, feedbackPayload);
    showNotification('Session rating and review submitted! Thank you.');
    await loadData();
    return res;
  };

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const peer = m.peer || {};
      const query = searchQuery.toLowerCase().trim();

      const matchesQuery =
        !query ||
        peer.name?.toLowerCase().includes(query) ||
        peer.college?.toLowerCase().includes(query) ||
        m.canLearnFromPeer?.some((s) => s.name?.toLowerCase().includes(query)) ||
        m.canTeachPeer?.some((s) => s.name?.toLowerCase().includes(query));

      if (!matchesQuery) return false;

      if (filterType === 'MUTUAL') return m.matchType === 'MUTUAL';
      if (filterType === 'MENTOR') return m.isMentor || m.matchType === 'UNILATERAL';
      return true;
    });
  }, [matches, searchQuery, filterType]);

  // Derived Counts
  const pendingIncomingCount = (requests.incoming || []).filter(
    (r) => r.status === 'PENDING'
  ).length;

  const scheduledSessionsCount = sessions.filter(
    (s) => s.status === 'SCHEDULED'
  ).length;

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* 1. Page Header: Where am I? What can I do here? What should I do next? */}
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Skill Exchange' },
        ]}
        badge="Peer Mentorship Engine"
        badgeIcon={Repeat}
        title="Skill Exchange & Peer Mentorship"
        description="Discover student developers with complementary teach/learn skills. Trade knowledge through 1-on-1 sessions, master new technologies, and expand your campus network."
        studentTip="A mutual match means you can teach them something they want to learn, and they can teach you something you want to learn!"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              isLoading={isLoading}
              icon={RefreshCw}
            >
              Refresh
            </Button>
            <Link to="/skills">
              <Button variant="primary" size="sm" icon={Layers}>
                Update My Skills
              </Button>
            </Link>
          </>
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

      {/* 2. Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'matches'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Smart Matches & Mentors</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {matches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'requests'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
        >
          <Inbox className="w-4 h-4 text-purple-400" />
          <span>Exchange Requests</span>
          {pendingIncomingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
              {pendingIncomingCount} pending
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'sessions'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Sessions & Reviews</span>
          {scheduledSessionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
              {scheduledSessionsCount} upcoming
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Smart Matches & Mentors */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-full sm:w-80">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search peers by name, skill, college..."
                ariaLabel="Search peers"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Type:
              </span>
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterType === 'ALL'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
              >
                All ({matches.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MUTUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterType === 'MUTUAL'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
              >
                Mutual Matches
              </button>
              <button
                type="button"
                onClick={() => setFilterType('MENTOR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterType === 'MENTOR'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
              >
                Peer Mentors
              </button>
            </div>
          </div>

          {/* Matches Grid */}
          {isLoading ? (
            <LoadingState rows={6} message="Searching for compatible peer mentors..." />
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMatches.map((m) => (
                <PeerMatchCard
                  key={m.peer?._id}
                  match={m}
                  onRequestClick={(match) => setSelectedMatchForRequest(match)}
                  onScheduleClick={(req) => setSelectedRequestForSchedule(req)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title={searchQuery || filterType !== 'ALL' ? 'No matching peers found' : 'No compatible peers yet'}
              description={
                searchQuery || filterType !== 'ALL'
                  ? 'Try clearing your search query or switching filters to see all available peer matches.'
                  : 'Add more skills you want to learn to your profile so the matching engine can find peers who can teach you!'
              }
              actionLabel={searchQuery || filterType !== 'ALL' ? 'Clear Filters' : 'Add Skills to Learn'}
              actionIcon={searchQuery || filterType !== 'ALL' ? undefined : Plus}
              onAction={() => {
                if (searchQuery || filterType !== 'ALL') {
                  setSearchQuery('');
                  setFilterType('ALL');
                } else {
                  window.location.href = '/skills';
                }
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: Exchange Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRequestTab('incoming')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${requestTab === 'incoming'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming Requests</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {requests.incoming?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRequestTab('outgoing')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${requestTab === 'outgoing'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Outgoing Requests</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {requests.outgoing?.length || 0}
              </span>
            </button>
          </div>

          {/* Incoming List */}
          {requestTab === 'incoming' && (
            <div className="space-y-4">
              {requests.incoming && requests.incoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.incoming.map((req) => (
                    <ExchangeRequestCard
                      key={req._id}
                      request={req}
                      isIncoming={true}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      onSchedule={(r) => setSelectedRequestForSchedule(r)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="No incoming requests"
                  description="When fellow students discover your profile and want to learn from you, their exchange proposals will appear here."
                  actionLabel="Explore Peers You Can Teach"
                  onAction={() => setActiveTab('matches')}
                />
              )}
            </div>
          )}

          {/* Outgoing List */}
          {requestTab === 'outgoing' && (
            <div className="space-y-4">
              {requests.outgoing && requests.outgoing.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.outgoing.map((req) => (
                    <ExchangeRequestCard
                      key={req._id}
                      request={req}
                      isIncoming={false}
                      onCancel={handleCancelRequest}
                      onSchedule={(r) => setSelectedRequestForSchedule(r)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Send}
                  title="No outgoing requests"
                  description="Browse compatible peers in the Smart Matches tab and propose an exchange to collaborate on learning."
                  actionLabel="Browse Compatible Peers"
                  onAction={() => setActiveTab('matches')}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Learning Sessions & Feedback */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSessionTab('upcoming')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${sessionTab === 'upcoming'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Upcoming / Active ({sessions.filter((s) => s.status === 'SCHEDULED').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSessionTab('completed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${sessionTab === 'completed'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed & Reviews ({sessions.filter((s) => s.status === 'COMPLETED').length})</span>
            </button>
          </div>

          {/* Session Cards */}
          <div className="space-y-4">
            {sessions
              .filter((s) =>
                sessionTab === 'upcoming'
                  ? s.status === 'SCHEDULED'
                  : s.status === 'COMPLETED' || s.status === 'CANCELLED'
              )
              .map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  currentUserId={user?._id}
                  onCompleteSession={handleCompleteSession}
                  onOpenFeedback={(s) => setSelectedSessionForFeedback(s)}
                />
              ))}

            {sessions.filter((s) =>
              sessionTab === 'upcoming'
                ? s.status === 'SCHEDULED'
                : s.status === 'COMPLETED' || s.status === 'CANCELLED'
            ).length === 0 && (
                <EmptyState
                  icon={Calendar}
                  title={`No ${sessionTab} learning sessions`}
                  description={
                    sessionTab === 'upcoming'
                      ? 'Accepted exchange partnerships allow you to schedule live 1-on-1 code walkthroughs.'
                      : 'Once you complete a scheduled session, it will be catalogued here with learner ratings and reviews.'
                  }
                  actionLabel={sessionTab === 'upcoming' ? 'Check Exchange Requests' : undefined}
                  onAction={sessionTab === 'upcoming' ? () => setActiveTab('requests') : undefined}
                />
              )}
          </div>
        </div>
      )}

      {/* MODAL 1: Request Exchange */}
      <RequestExchangeModal
        isOpen={!!selectedMatchForRequest}
        onClose={() => setSelectedMatchForRequest(null)}
        match={selectedMatchForRequest}
        onSendRequest={handleSendExchangeRequest}
      />

      {/* MODAL 2: Schedule Session */}
      <ScheduleSessionModal
        isOpen={!!selectedRequestForSchedule}
        onClose={() => setSelectedRequestForSchedule(null)}
        request={selectedRequestForSchedule}
        currentUserId={user?._id}
        onSessionScheduled={handleSessionScheduled}
      />

      {/* MODAL 3: Submit Feedback */}
      <SessionFeedbackModal
        isOpen={!!selectedSessionForFeedback}
        onClose={() => setSelectedSessionForFeedback(null)}
        session={selectedSessionForFeedback}
        onSubmitFeedback={handleSubmitFeedback}
      />
    </div>
  );
};

export default SkillExchangePage;
