import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { 
  Sparkles, 
  Repeat, 
  GraduationCap, 
  Send, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const RequestExchangeModal = ({
  isOpen,
  onClose,
  match,
  onSendRequest,
}) => {
  const [message, setMessage] = useState('');
  const [selectedOfferedSkills, setSelectedOfferedSkills] = useState([]);
  const [selectedRequestedSkills, setSelectedRequestedSkills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!match) return null;

  const peer = match.peer || {};
  const canLearn = match.canLearnFromPeer || [];
  const canTeach = match.canTeachPeer || [];

  const toggleOffered = (skillId) => {
    setSelectedOfferedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const toggleRequested = (skillId) => {
    setSelectedRequestedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        receiverId: peer._id,
        offeredSkillIds:
          selectedOfferedSkills.length > 0 ? selectedOfferedSkills : canTeach.map((s) => s._id),
        requestedSkillIds:
          selectedRequestedSkills.length > 0 ? selectedRequestedSkills : canLearn.map((s) => s._id),
        message: message.trim(),
      };

      await onSendRequest(payload);
      setMessage('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send exchange request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Skill Exchange"
      subtitle={`Propose a collaborative learning partnership with ${peer.name}.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Peer Header */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <Avatar name={peer.name || 'Peer'} src={peer.profileImage} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white truncate">{peer.name}</h4>
              <Badge variant="brand" size="xs">
                {match.compatibilityScore}% Compatible
              </Badge>
            </div>
            <p className="text-xs text-slate-400 truncate">{peer.college}</p>
          </div>
        </div>

        {/* What You Want to Learn */}
        {canLearn.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-purple-400" />
              Skills you will learn from {peer.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {canLearn.map((s) => {
                const isSelected =
                  selectedRequestedSkills.length === 0 ||
                  selectedRequestedSkills.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleRequested(s._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{s.name} ({s.level.toLowerCase()})</span>
                    {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* What You Offer to Teach */}
        {canTeach.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              Skills you offer to teach {peer.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {canTeach.map((s) => {
                const isSelected =
                  selectedOfferedSkills.length === 0 ||
                  selectedOfferedSkills.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleOffered(s._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500 text-brand-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{s.name} ({s.level.toLowerCase()})</span>
                    {isSelected && <Check className="w-3 h-3 text-brand-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Personal Note / Learning Goals
          </label>
          <textarea
            name="message"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${peer.name}! I noticed you're skilled in ${canLearn[0]?.name || 'tech'}. I'd love to connect for peer sessions and can exchange my knowledge in ${canTeach[0]?.name || 'software'}...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={Send}
          >
            Send Exchange Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestExchangeModal;
