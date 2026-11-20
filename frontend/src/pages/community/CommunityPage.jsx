import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Plus,
  Eye,
  Search,
  Filter,
  User,
  X
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const CommunityPage = () => {
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('latest'); // latest, top, solved

  // New discussion modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active discussion view modal
  const [activeThread, setActiveThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/community/discussions?filter=${filter}&search=${search}`);
      if (response.success && response.data) {
        setDiscussions(response.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [filter, search]);

  const handleVote = async (id, voteType, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to vote on discussions.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/community/discussions/${id}/vote`, { voteType });
      if (res.success && res.data) {
        setDiscussions(prev =>
          prev.map(d =>
            d.id === id
              ? {
                  ...d,
                  upvotesCount: res.data.upvotesCount,
                  downvotesCount: res.data.downvotesCount,
                  userVote: res.data.userVote
                }
              : d
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to post questions.', type: 'info' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/community/discussions', {
        title: newTitle,
        content: newContent
      });
      if (res.success) {
        setToast({ title: 'Discussion Started', message: 'Your question has been posted to the forum.', type: 'APPROVAL' });
        setModalOpen(false);
        setNewTitle('');
        setNewContent('');
        fetchDiscussions();
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message, type: 'REJECTION' });
    } finally {
      setSubmitting(false);
    }
  };

  const openThread = async (discId) => {
    setThreadLoading(true);
    try {
      const res = await api.get(`/community/discussions/${discId}`);
      if (res.success && res.data?.discussion) {
        setActiveThread(res.data.discussion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setThreadLoading(false);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to post replies.', type: 'info' });
      return;
    }
    if (!replyContent.trim()) return;

    try {
      const res = await api.post(`/community/discussions/${activeThread.id}/comments`, {
        content: replyContent
      });
      if (res.success && res.data?.comment) {
        setActiveThread(prev => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment]
        }));
        setReplyContent('');
        setToast({ title: 'Reply Posted', message: 'Your response has been published.', type: 'APPROVAL' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
            Student Knowledge Exchange
          </span>
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white mt-1">
            Student Community Discussion Forum
          </h1>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400 mt-1">
            Discuss challenging legal doctrines, examine past exam problems, and share academic insights with fellow Karnataka law scholars.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              setToast({ title: 'Sign In Required', message: 'Please log in to start a discussion.', type: 'info' });
            } else {
              setModalOpen(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Question / Start Topic</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions (e.g. Article 21, Rylands v Fletcher, Section 138)..."
            className="w-full pl-10 pr-4 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {['latest', 'top', 'solved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filter === f
                  ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                  : 'text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      {loading ? (
        <CardSkeleton />
      ) : discussions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions found"
          description="Be the first to post a question or topic to help other law students."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-semibold rounded-xl"
            >
              Start New Topic
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <div
              key={d.id}
              onClick={() => openThread(d.id)}
              className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-800 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Voting column */}
                <div className="flex flex-col items-center justify-center bg-navy-50 dark:bg-navy-800/60 p-2 rounded-xl text-xs shrink-0 min-w-[50px]">
                  <button
                    onClick={(e) => handleVote(d.id, 'UPVOTE', e)}
                    className={`p-1 rounded transition ${
                      d.userVote === 'UPVOTE' ? 'text-emerald-500' : 'text-navy-400 hover:text-emerald-500'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-navy-800 dark:text-navy-200">{d.upvotesCount}</span>
                  <button
                    onClick={(e) => handleVote(d.id, 'DOWNVOTE', e)}
                    className={`p-1 rounded transition ${
                      d.userVote === 'DOWNVOTE' ? 'text-rose-500' : 'text-navy-400 hover:text-rose-500'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.isSolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Solved</span>
                      </span>
                    )}
                    {d.subject && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
                        {d.subject.code} - {d.subject.name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 transition">
                    {d.title}
                  </h3>

                  <p className="text-xs text-navy-600 dark:text-navy-400 line-clamp-2">
                    {d.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-navy-400">
                    <span>Posted by {d.author?.fullName}</span>
                    <span>•</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Comments counter */}
              <div className="flex items-center gap-1.5 text-xs text-navy-500 shrink-0 self-end sm:self-auto px-3 py-1.5 bg-navy-50 dark:bg-navy-800/60 rounded-xl">
                <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
                <span className="font-semibold">{d._count?.comments || 0} answers</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discussion Thread Modal */}
      {activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-navy-200 dark:border-navy-700 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-navy-100 dark:border-navy-800">
              <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white truncate mr-4">
                {activeThread.title}
              </h3>
              <button
                onClick={() => setActiveThread(null)}
                className="text-navy-400 hover:text-navy-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Question */}
              <div className="p-4 bg-navy-50 dark:bg-navy-800/40 rounded-2xl border border-navy-100 dark:border-navy-800 space-y-3">
                <div className="flex items-center justify-between text-navy-500">
                  <span className="font-semibold text-navy-800 dark:text-navy-200">
                    {activeThread.author?.fullName} ({activeThread.author?.collegeName || 'Student Scholar'})
                  </span>
                  <span>{new Date(activeThread.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-navy-800 dark:text-navy-200 leading-relaxed whitespace-pre-wrap">
                  {activeThread.content}
                </p>
              </div>

              {/* Answers */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-navy-500">
                  Peer Answers ({activeThread.comments?.length || 0})
                </h4>

                {activeThread.comments?.length === 0 ? (
                  <p className="text-navy-400 italic">No answers posted yet. Add your insight below.</p>
                ) : (
                  activeThread.comments?.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        c.isAcceptedAnswer
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-navy-800/40 border-navy-100 dark:border-navy-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-navy-900 dark:text-white">
                            {c.author?.fullName}
                          </span>
                          {c.isAcceptedAnswer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Accepted Answer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-navy-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-navy-700 dark:text-navy-300 leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleAddReply} className="p-4 border-t border-navy-100 dark:border-navy-800 flex gap-2">
              <input
                type="text"
                required
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your answer or reference relevant case laws..."
                className="flex-1 px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl transition shrink-0"
              >
                Post Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Start New Discussion Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 border border-navy-200 dark:border-navy-700 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-navy-900 dark:text-white">
                Start a New Discussion Thread
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-navy-400 hover:text-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Discussion Title / Question *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to differentiate between Murder and Culpable Homicide under IPC?"
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">
                  Detailed Explanation / Context *
                </label>
                <textarea
                  rows="4"
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Specify the scheme, section numbers, or dilemmas you are facing..."
                  className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-navy-200 dark:border-navy-700 rounded-lg text-navy-700 dark:text-navy-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-navy-900 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-lg shadow-md"
                >
                  {submitting ? 'Posting...' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
