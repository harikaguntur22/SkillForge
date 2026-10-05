import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { 
  Calendar, 
  Clock, 
  Video, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';

export const ScheduleSessionModal = ({
  isOpen,
  onClose,
  request,
  currentUserId,
  onSessionScheduled,
}) => {
  const isSender = request?.senderId?._id === currentUserId;
  const peer = isSender ? request?.receiverId : request?.senderId;

  // Decide candidate skills for this session: combination of offered and requested
  const allExchangeSkills = [
    ...(request?.offeredSkillIds || []),
    ...(request?.requestedSkillIds || []),
  ];

  const defaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    skillId: allExchangeSkills[0]?._id || '',
    scheduledAt: defaultDateTime(),
    durationMinutes: 45,
    meetingUrl: '',
    mentorNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'durationMinutes' ? parseInt(value, 10) || 45 : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skillId && allExchangeSkills.length > 0) {
      formData.skillId = allExchangeSkills[0]._id;
    }

    if (!formData.scheduledAt) {
      setError('Please select a date and time for the session.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        exchangeRequestId: request._id,
        mentorId: isSender ? request.senderId._id : request.receiverId._id,
        learnerId: isSender ? request.receiverId._id : request.senderId._id,
        skillId: formData.skillId || allExchangeSkills[0]?._id,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        durationMinutes: parseInt(formData.durationMinutes, 10),
        meetingUrl: formData.meetingUrl.trim(),
        mentorNotes: formData.mentorNotes.trim(),
      };

      await onSessionScheduled(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Peer Learning Session"
      subtitle={`Set up a 1-on-1 collaborative code session with ${peer?.name}.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Skill Focus Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-400" />
            Session Focus Skill
          </label>
          <select
            name="skillId"
            value={formData.skillId}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {allExchangeSkills.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            name="scheduledAt"
            type="datetime-local"
            icon={Calendar}
            value={formData.scheduledAt}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              Duration
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hours)</option>
            </select>
          </div>
        </div>

        {/* Meeting URL */}
        <Input
          label="Meeting URL (Google Meet / Zoom / Discord)"
          name="meetingUrl"
          placeholder="https://meet.google.com/xyz-abc-123"
          icon={Video}
          value={formData.meetingUrl}
          onChange={handleChange}
          helperText="Where you will connect online for audio/video or screen sharing."
        />

        {/* Notes / Agenda */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Topics & Preparation Notes
          </label>
          <textarea
            name="mentorNotes"
            rows="3"
            value={formData.mentorNotes}
            onChange={handleChange}
            placeholder="e.g. Setting up dev environment, debugging database indexing, code walkthrough..."
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
            icon={Calendar}
          >
            Confirm & Schedule Session
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleSessionModal;
