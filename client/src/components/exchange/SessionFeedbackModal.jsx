import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common/Button';
import { Star, AlertCircle, Award } from 'lucide-react';

export const SessionFeedbackModal = ({
  isOpen,
  onClose,
  session,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!session) return null;

  const mentor = session.mentorId || {};
  const skill = session.skillId || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmitFeedback(session._id, {
        rating,
        review: review.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit session feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Peer Session Review & Rating"
      subtitle={`Rate your learning session with ${mentor.name} on ${skill.name}.`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-center">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            How was your session?
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-600 transition-colors focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-transform hover:scale-110 ${
                      active
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs font-medium text-amber-400">
            {rating === 5 && '🌟 Outstanding Mentorship!'}
            {rating === 4 && '👍 Great & Very Helpful'}
            {rating === 3 && '👌 Good Knowledge Exchange'}
            {rating === 2 && '👎 Room for Improvement'}
            {rating === 1 && '⚠️ Needs Significant Work'}
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Review & Endorsement Notes
          </label>
          <textarea
            name="review"
            rows="3"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={`Highlight what you learned from ${mentor.name}, their teaching style, and how it helped your project goals...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            icon={Award}
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SessionFeedbackModal;
