import React from 'react';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Sparkles, 
  Repeat, 
  GraduationCap, 
  CheckCircle2, 
  Send, 
  Check, 
  Clock, 
  Calendar,
  Layers
} from 'lucide-react';

export const PeerMatchCard = ({ match, onRequestClick, onScheduleClick }) => {
  const peer = match.peer || {};
  const canLearn = match.canLearnFromPeer || [];
  const canTeach = match.canTeachPeer || [];
  const existingReq = match.existingRequest;

  const isMutual = match.matchType === 'MUTUAL';

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-brand-400 bg-brand-500/10 border-brand-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <Card hoverEffect className="space-y-4 border-slate-800 bg-slate-900/70 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={peer.name || 'User'} src={peer.profileImage} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{peer.name}</h3>
                <Badge variant={isMutual ? 'purple' : 'brand'} size="xs">
                  {isMutual ? 'Mutual Match' : 'Peer Mentor'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">{peer.college}</p>
              <p className="text-[11px] text-brand-400 font-medium truncate max-w-[200px]">
                {peer.targetRole || 'Developer'}
              </p>
            </div>
          </div>

          {/* Compatibility Score */}
          <div
            className={`px-2.5 py-1 rounded-xl border text-center font-bold text-xs shrink-0 ${getScoreColor(
              match.compatibilityScore
            )}`}
          >
            <div className="text-sm leading-none">{match.compatibilityScore}%</div>
            <div className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Match</div>
          </div>
        </div>

        {/* Complementary Skills Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
          {/* Can Learn */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 uppercase tracking-wider">
              <Repeat className="w-3 h-3" /> Can Teach You:
            </span>
            <div className="flex flex-wrap gap-1">
              {canLearn.map((s) => (
                <span
                  key={s._id}
                  className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[11px] font-medium border border-purple-500/20"
                >
                  {s.name} ({s.level?.slice(0, 3)})
                </span>
              ))}
              {canLearn.length === 0 && (
                <span className="text-slate-500 text-[11px]">Mentoring request</span>
              )}
            </div>
          </div>

          {/* Can Teach */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-brand-400 flex items-center gap-1 uppercase tracking-wider">
              <GraduationCap className="w-3 h-3" /> You Can Teach:
            </span>
            <div className="flex flex-wrap gap-1">
              {canTeach.map((s) => (
                <span
                  key={s._id}
                  className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 text-[11px] font-medium border border-brand-500/20"
                >
                  {s.name} ({s.level?.slice(0, 3)})
                </span>
              ))}
              {canTeach.length === 0 && (
                <span className="text-slate-500 text-[11px]">Seek mentorship</span>
              )}
            </div>
          </div>
        </div>

        {/* Why You Match Bullet Reasons */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Why You Match:
          </p>
          <ul className="text-xs text-slate-300 space-y-1">
            {match.matchReasons?.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-brand-400 mt-0.5 shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        {existingReq ? (
          existingReq.status === 'ACCEPTED' ? (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="success" size="sm">
                <Check className="w-3.5 h-3.5" /> Exchange Active
              </Badge>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onScheduleClick(existingReq)}
                icon={Calendar}
              >
                Schedule Session
              </Button>
            </div>
          ) : existingReq.status === 'PENDING' ? (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <Badge variant="warning" size="sm">
                <Clock className="w-3.5 h-3.5" /> Request Pending
              </Badge>
              <span className="text-[11px] text-slate-500">
                {existingReq.isSender ? 'Awaiting peer response' : 'Awaiting your action'}
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => onRequestClick(match)}
              icon={Send}
            >
              Request Exchange
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => onRequestClick(match)}
            icon={Send}
          >
            Request Exchange
          </Button>
        )}
      </div>
    </Card>
  );
};

export default PeerMatchCard;
