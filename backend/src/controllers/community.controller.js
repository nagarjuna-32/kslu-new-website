const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { discussionSchema, commentSchema } = require('../validators');
const { recordAuditLog } = require('../middleware/audit.middleware');

const listDiscussions = async (req, res, next) => {
  try {
    const {
      courseId,
      semesterId,
      subjectId,
      search,
      filter = 'latest', // latest, top, solved
      page = 1,
      limit = 15
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (semesterId) where.semesterId = semesterId;
    if (subjectId) where.subjectId = subjectId;

    if (filter === 'solved') {
      where.isSolved = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }

    let orderBy = {};
    if (filter === 'top') {
      orderBy = { upvotesCount: 'desc' };
    } else {
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
    }

    const [total, items] = await Promise.all([
      prisma.discussion.count({ where }),
      prisma.discussion.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          author: { select: { id: true, fullName: true, role: true, collegeName: true } },
          subject: { select: { id: true, name: true, code: true } },
          course: { select: { id: true, code: true } },
          semester: { select: { title: true } },
          _count: { select: { comments: true } }
        }
      })
    ]);

    // Attach user vote if logged in
    let enriched = items;
    if (req.user) {
      const userVotes = await prisma.discussionVote.findMany({
        where: {
          userId: req.user.id,
          discussionId: { in: items.map(i => i.id) }
        }
      });
      const voteMap = new Map(userVotes.map(v => [v.discussionId, v.voteType]));
      enriched = items.map(i => ({
        ...i,
        userVote: voteMap.get(i.id) || null
      }));
    }

    return paginatedResponse(res, enriched, total, pageNum, limitNum, 'Discussions retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const getDiscussionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true, role: true, collegeName: true } },
        subject: true,
        course: true,
        semester: true,
        comments: {
          orderBy: [{ isAcceptedAnswer: 'desc' }, { createdAt: 'asc' }],
          include: {
            author: { select: { id: true, fullName: true, role: true, collegeName: true } },
            childComments: {
              include: {
                author: { select: { id: true, fullName: true, role: true, collegeName: true } }
              }
            }
          }
        }
      }
    });

    if (!discussion) {
      return errorResponse(res, 'Discussion not found.', 404);
    }

    // Increment views
    await prisma.discussion.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    });

    let userVote = null;
    if (req.user) {
      const vote = await prisma.discussionVote.findUnique({
        where: {
          userId_discussionId: {
            userId: req.user.id,
            discussionId: id
          }
        }
      });
      userVote = vote ? vote.voteType : null;
    }

    return successResponse(res, { discussion: { ...discussion, userVote } });
  } catch (error) {
    next(error);
  }
};

const createDiscussion = async (req, res, next) => {
  try {
    const validated = discussionSchema.parse(req.body);

    const discussion = await prisma.discussion.create({
      data: {
        title: validated.title,
        content: validated.content,
        courseId: validated.courseId || null,
        semesterId: validated.semesterId || null,
        subjectId: validated.subjectId || null,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        subject: true
      }
    });

    await recordAuditLog(req.user.id, 'DISCUSSION_CREATED', 'Discussion', discussion.id, { title: discussion.title }, req);
    return successResponse(res, { discussion }, 'Discussion created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const voteDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    if (!['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return errorResponse(res, 'Invalid vote type.', 400);
    }

    const disc = await prisma.discussion.findUnique({ where: { id } });
    if (!disc) return errorResponse(res, 'Discussion not found.', 404);

    const existingVote = await prisma.discussionVote.findUnique({
      where: {
        userId_discussionId: { userId, discussionId: id }
      }
    });

    let newUp = disc.upvotesCount;
    let newDown = disc.downvotesCount;
    let currentVote = null;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await prisma.discussionVote.delete({ where: { id: existingVote.id } });
        if (voteType === 'UPVOTE') newUp = Math.max(0, newUp - 1);
        else newDown = Math.max(0, newDown - 1);
        currentVote = null;
      } else {
        await prisma.discussionVote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
        if (voteType === 'UPVOTE') {
          newUp += 1;
          newDown = Math.max(0, newDown - 1);
        } else {
          newDown += 1;
          newUp = Math.max(0, newUp - 1);
        }
        currentVote = voteType;
      }
    } else {
      await prisma.discussionVote.create({
        data: { userId, discussionId: id, voteType }
      });
      if (voteType === 'UPVOTE') newUp += 1;
      else newDown += 1;
      currentVote = voteType;
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: { upvotesCount: newUp, downvotesCount: newDown }
    });

    return successResponse(res, {
      upvotesCount: updated.upvotesCount,
      downvotesCount: updated.downvotesCount,
      userVote: currentVote
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params; // discussionId
    const validated = commentSchema.parse(req.body);

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) return errorResponse(res, 'Discussion not found.', 404);

    const comment = await prisma.comment.create({
      data: {
        discussionId: id,
        authorId: req.user.id,
        content: validated.content,
        parentCommentId: validated.parentCommentId || null
      },
      include: {
        author: { select: { id: true, fullName: true, role: true, collegeName: true } }
      }
    });

    // Notify discussion author if someone else replies
    if (discussion.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: discussion.authorId,
          title: 'New Reply to Your Discussion',
          message: `${req.user.fullName} replied to: "${discussion.title.substring(0, 50)}..."`,
          type: 'COMMUNITY',
          linkUrl: `/community/${discussion.id}`
        }
      });
    }

    return successResponse(res, { comment }, 'Comment added successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const markAcceptedAnswer = async (req, res, next) => {
  try {
    const { discussionId, commentId } = req.params;

    const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!discussion) return errorResponse(res, 'Discussion not found.', 404);

    if (discussion.authorId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return errorResponse(res, 'Only the discussion author or admin can accept an answer.', 403);
    }

    // Reset existing accepted answers for this discussion
    await prisma.comment.updateMany({
      where: { discussionId },
      data: { isAcceptedAnswer: false }
    });

    // Set new accepted answer
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { isAcceptedAnswer: true }
    });

    // Mark discussion as solved
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { isSolved: true }
    });

    return successResponse(res, { comment }, 'Marked as accepted answer.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDiscussions,
  getDiscussionById,
  createDiscussion,
  voteDiscussion,
  addComment,
  markAcceptedAnswer
};
