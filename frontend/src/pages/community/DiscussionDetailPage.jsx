import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Share2,
  Calendar,
  User,
  School,
  Send
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const DiscussionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { setToast } = useNotification();

  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchDiscussion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/community/discussions/${id}`);
      if (res.success && res.data?.discussion) {
        setDiscussion(res.data.discussion);
      } else {
        setToast({ title: 'Not Found', message: 'Discussion thread not found.', type: 'REJECTION' });
        navigate('/community');
      }
    } catch (err) {
      console.error(err);
      setToast({ title: 'Error', message: 'Failed to load discussion thread.', type: 'REJECTION' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to vote.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/community/discussions/${id}/vote`, { voteType });
      if (res.success && res.data) {
        setDiscussion(prev => ({
          ...prev,
          upvotesCount: res.data.upvotesCount,
          downvotesCount: res.data.downvotesCount,
          userVote: res.data.userVote
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to reply.', type: 'info' });
      return;
    }
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.post(`/community/discussions/${id}/comments`, {
        content: replyContent
      });
      if (res.success && res.data?.comment) {
        setDiscussion(prev => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment]
        }));
        setReplyContent('');
        setToast({ title: 'Reply Posted', message: 'Your response was added successfully.', type: 'APPROVAL' });
      }
    } catch (err) {
      setToast({ title: 'Error', message: err.message || 'Failed to post reply.', type: 'REJECTION' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({ title: 'Link Copied', message: 'Discussion link copied to clipboard.', type: 'APPROVAL' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  if (!discussion) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Helmet>
        <title>{discussion.title} | Student Community | KSLU Circle</title>
        <meta name="description" content={discussion.content.substring(0, 160)} />
      </Helmet>

      {/* Back & Actions Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-xs font-semibold text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Discussions</span>
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Thread</span>
        </button>
      </div>

      {/* Main Discussion Thread */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          {discussion.isSolved && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved
            </span>
          )}
          {discussion.subject && (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300">
              {discussion.subject.code} • {discussion.subject.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white leading-tight">
          {discussion.title}
        </h1>

        {/* Author / Date info */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-navy-500 pb-4 border-b border-navy-100 dark:border-navy-800">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-navy-400" />
            <span className="font-semibold text-navy-800 dark:text-navy-200">
              {discussion.author?.fullName || 'Student'}
            </span>
          </div>
          {discussion.author?.collegeName && (
            <div className="flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-navy-400" />
              <span>{discussion.author.collegeName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-navy-400" />
            <span>{new Date(discussion.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
        </div>

        {/* Question Body */}
        <div className="text-sm text-navy-800 dark:text-navy-200 leading-relaxed whitespace-pre-wrap">
          {discussion.content}
        </div>

        {/* Vote buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-navy-100 dark:border-navy-800">
          <div className="inline-flex items-center gap-2 bg-navy-50 dark:bg-navy-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => handleVote('UPVOTE')}
              className={`p-1 rounded transition ${
                discussion.userVote === 'UPVOTE' ? 'text-emerald-500' : 'text-navy-400 hover:text-emerald-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className="text-navy-800 dark:text-navy-200 font-bold">{discussion.upvotesCount}</span>
            <button
              onClick={() => handleVote('DOWNVOTE')}
              className={`p-1 rounded transition ${
                discussion.userVote === 'DOWNVOTE' ? 'text-rose-500' : 'text-navy-400 hover:text-rose-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-navy-400">
            {discussion.comments?.length || 0} Peer Responses
          </span>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold-500" />
          <span>Responses ({discussion.comments?.length || 0})</span>
        </h2>

        {/* Existing comments */}
        {(!discussion.comments || discussion.comments.length === 0) ? (
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 text-center text-xs text-navy-500">
            No responses yet. Share your legal analysis or practical insight below.
          </div>
        ) : (
          <div className="space-y-4">
            {discussion.comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-3 transition ${
                  comment.isAcceptedAnswer
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-800 dark:text-navy-200">
                      {comment.author?.fullName || 'Anonymous Contributor'}
                    </span>
                    {comment.author?.collegeName && (
                      <span className="hidden sm:inline text-navy-400">({comment.author.collegeName})</span>
                    )}
                    {comment.isAcceptedAnswer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Accepted Solution
                      </span>
                    )}
                  </div>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-navy-800 dark:text-navy-200 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Box */}
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500">
            Contribute Your Answer
          </h3>

          {!isAuthenticated ? (
            <div className="p-4 bg-navy-50 dark:bg-navy-800/60 rounded-xl text-center text-xs text-navy-600 dark:text-navy-400">
              Please{' '}
              <Link to="/login" className="font-bold text-gold-600 dark:text-gold-400 underline">
                sign in
              </Link>{' '}
              to participate in discussions.
            </div>
          ) : (
            <form onSubmit={handleAddReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                placeholder="Write your analysis, statutory references, or relevant precedents..."
                required
                className="w-full p-3.5 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-xs sm:text-sm text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReply ? 'Posting...' : 'Post Answer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
