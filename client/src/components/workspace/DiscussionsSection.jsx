import React, { useState } from 'react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import Modal from '../common/Modal';
import {
  MessageSquare,
  Pin,
  Send,
  Plus,
  Trash2,
  HelpCircle,
  Code2,
  Megaphone,
  MessageCircle,
} from 'lucide-react';

const CATEGORY_META = {
  GENERAL: { label: 'General', variant: 'brand', icon: MessageCircle },
  TECHNICAL: { label: 'Technical', variant: 'purple', icon: Code2 },
  ANNOUNCEMENT: { label: 'Announcement', variant: 'warning', icon: Megaphone },
  QUESTION: { label: 'Question', variant: 'sky', icon: HelpCircle },
};

export const DiscussionsSection = ({
  discussions = [],
  onCreateDiscussion,
  onReplyDiscussion,
  onDeleteDiscussion,
  currentUserId,
  isCreator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [pinned, setPinned] = useState(false);

  // Per-discussion reply text state
  const [replyTextMap, setReplyTextMap] = useState({});
  const [expandedThreadId, setExpandedThreadId] = useState(null);

  const handleStartDiscussion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    await onCreateDiscussion({
      title: title.trim(),
      message: message.trim(),
      category,
      pinned,
    });

    setTitle('');
    setMessage('');
    setCategory('GENERAL');
    setPinned(false);
    setIsModalOpen(false);
  };

  const handleSendReply = async (discussionId) => {
    const text = replyTextMap[discussionId];
    if (!text || !text.trim()) return;

    await onReplyDiscussion(discussionId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [discussionId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            Team Discussions & Communication
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Collaborate on architecture, questions, design choices, and sprint decisions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Topic
        </Button>
      </div>

      {/* Discussion Threads List */}
      {discussions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No discussions yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Start a thread to discuss tech stack trade-offs, architecture decisions, or next steps.
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
          >
            Start Conversation
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((thread) => {
            const meta = CATEGORY_META[thread.category] || CATEGORY_META.GENERAL;
            const CategoryIcon = meta.icon;
            const author = thread.authorId || {};
            const isThreadAuthor =
              author._id === currentUserId || author === currentUserId;
            const canDelete = isCreator || isThreadAuthor;

            const isExpanded =
              expandedThreadId === thread._id || (thread.replies || []).length > 0;

            return (
              <div
                key={thread._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                {/* Thread Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={author.avatar}
                      name={author.name || 'Member'}
                      size="md"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {author.name || 'Collaborator'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(thread.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                        {thread.pinned && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                            <Pin className="w-3 h-3" />
                            Pinned
                          </span>
                        )}
                        <Badge
                          variant={meta.variant}
                          className="flex items-center gap-1 text-[10px]"
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {meta.label}
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                        {thread.title}
                      </h4>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => onDeleteDiscussion(thread._id)}
                      title="Delete discussion"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Message Body */}
                <div className="text-sm text-slate-300 leading-relaxed pl-12">
                  <p className="whitespace-pre-line">{thread.message}</p>
                </div>

                {/* Replies Stream */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="pl-12 pt-3 border-t border-slate-800/80 space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Replies ({thread.replies.length})
                    </p>

                    <div className="space-y-3">
                      {thread.replies.map((reply) => {
                        const replyAuthor = reply.authorId || {};
                        return (
                          <div
                            key={reply._id}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/60"
                          >
                            <Avatar
                              src={replyAuthor.avatar}
                              name={replyAuthor.name || 'Member'}
                              size="sm"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {replyAuthor.name || 'Team Member'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(reply.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 whitespace-pre-line">
                                {reply.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="pl-12 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyTextMap[thread._id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({
                          ...replyTextMap,
                          [thread._id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendReply(thread._id);
                        }
                      }}
                      placeholder="Write a reply..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      onClick={() => handleSendReply(thread._id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Discussion Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start Team Discussion"
        subtitle="Post a topic for your project collaborators"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleStartDiscussion} className="space-y-4">
          <Input
            label="Topic Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. State Management Architecture: Redux Toolkit vs Zustand"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-brand-500"
              >
                <option value="GENERAL">General Discussion</option>
                <option value="TECHNICAL">Technical & Code</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="QUESTION">Question</option>
              </select>
            </div>

            {isCreator && (
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="pinned-checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-slate-800 text-brand-500 focus:ring-brand-500 w-4 h-4 bg-slate-950"
                />
                <label
                  htmlFor="pinned-checkbox"
                  className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-1"
                >
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                  Pin to top
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Message / Context
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Provide background, proposed solution, or discussion prompt..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Post Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscussionsSection;
