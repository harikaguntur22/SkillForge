import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Check, 
  X, 
  Trash2, 
  Calendar, 
  MessageSquare, 
  Repeat, 
  GraduationCap, 
  Clock 
} from 'lucide-react';

export const ExchangeRequestCard = ({
  request,
  isIncoming = false,
  onAccept,
  onReject,
  onCancel,
  onSchedule,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const peer = isIncoming ? request.senderId : request.receiverId;
  const isPending = request.status === 'PENDING';
  const isAccepted = request.status === 'ACCEPTED';

  const handleAction = async (actionFn) => {
    setIsProcessing(true);
    try {
      await actionFn(request._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success">Accepted</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card hoverEffect className="space-y-4 border-slate-800 bg-slate-900/70">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={peer?.name || 'User'} src={peer?.profileImage} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{peer?.name}</h4>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-xs text-slate-400">{peer?.college}</p>
          </div>
        </div>

        {request.compatibilityScore && (
          <Badge variant="brand" size="sm">
            {request.compatibilityScore}% Match
          </Badge>
        )}
      </div>

      {/* Skills Matrix in this Exchange */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-brand-400 flex items-center gap-1 uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5" /> Offered Skills:
          </span>
          <div className="flex flex-wrap gap-1">
            {request.offeredSkillIds?.map((s) => (
              <span key={s._id} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 text-[11px] font-medium border border-brand-500/20">
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 uppercase tracking-wider mb-1">
            <Repeat className="w-3.5 h-3.5" /> Requested Skills:
          </span>
          <div className="flex flex-wrap gap-1">
            {request.requestedSkillIds?.map((s) => (
              <span key={s._id} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[11px] font-medium border border-purple-500/20">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <p className="italic">"{request.message}"</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-slate-500 text-[11px]">
          {new Date(request.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>

        <div className="flex items-center gap-2">
          {isIncoming && isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
                onClick={() => handleAction(onReject)}
                isLoading={isProcessing}
                icon={X}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction(onAccept)}
                isLoading={isProcessing}
                icon={Check}
              >
                Accept Exchange
              </Button>
            </>
          )}

          {!isIncoming && isPending && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
              onClick={() => handleAction(onCancel)}
              isLoading={isProcessing}
              icon={Trash2}
            >
              Cancel Request
            </Button>
          )}

          {isAccepted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSchedule(request)}
              icon={Calendar}
            >
              Schedule Session
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ExchangeRequestCard;
