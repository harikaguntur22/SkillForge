import React from 'react';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  FileText,
  Award
} from 'lucide-react';

export const SessionCard = ({
  session,
  currentUserId,
  onCompleteSession,
  onOpenFeedback,
}) => {
  const mentor = session.mentorId || {};
  const learner = session.learnerId || {};
  const skill = session.skillId || {};

  const isMentor = mentor._id === currentUserId;
  const isLearner = learner._id === currentUserId;

  const sessionDate = new Date(session.scheduledAt);
  const isCompleted = session.status === 'COMPLETED';
  const isScheduled = session.status === 'SCHEDULED';
  const hasFeedback = !!session.learnerFeedback?.rating;

  return (
    <Card hoverEffect className="space-y-4 border-slate-800 bg-slate-900/70">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">
              {skill.name} Mentorship Session
            </h4>
            <Badge
              variant={
                isCompleted
                  ? 'success'
                  : isScheduled
                  ? 'brand'
                  : 'default'
              }
              size="xs"
            >
              {session.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              {sessionDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {sessionDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              ({session.durationMinutes} min)
            </span>
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Avatar name={mentor.name || 'Mentor'} src={mentor.profileImage} size="sm" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-brand-400 block">Mentor</span>
            <span className="font-semibold text-white truncate block">{mentor.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar name={learner.name || 'Learner'} src={learner.profileImage} size="sm" />
          <div className="truncate">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">Learner</span>
            <span className="font-semibold text-white truncate block">{learner.name}</span>
          </div>
        </div>
      </div>

      {/* Meeting Link or Notes */}
      {session.meetingUrl && (
        <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 truncate">
            <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{session.meetingUrl}</span>
          </div>
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-semibold shrink-0 ml-2"
          >
            <span>Join</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {session.mentorNotes && (
        <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          "{session.mentorNotes}"
        </p>
      )}

      {/* Learner Feedback Display */}
      {hasFeedback && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Learner Review:
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(session.learnerFeedback.rating)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
          </div>
          {session.learnerFeedback.review && (
            <p className="text-slate-300 text-[11px] italic">
              "{session.learnerFeedback.review}"
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
        {isScheduled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompleteSession(session._id)}
            icon={CheckCircle2}
            className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            Mark Completed
          </Button>
        )}

        {isCompleted && isLearner && !hasFeedback && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOpenFeedback(session)}
            icon={Star}
          >
            Leave Rating & Review
          </Button>
        )}
      </div>
    </Card>
  );
};

export default SessionCard;
