const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { noteUploadSchema, adminResourceSchema } = require('../validators');
const { uploadFile, deleteFile } = require('../services/file.service');
const { emitToUser } = require('../services/socket.service');
const { recordAuditLog } = require('../middleware/audit.middleware');

const listNotes = async (req, res, next) => {
  try {
    const {
      courseId,
      semesterId,
      subjectId,
      schemeId,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Public list only shows APPROVED notes
    const where = { status: 'APPROVED' };

    let targetSubject = null;
    if (subjectId) {
      targetSubject = await prisma.subject.findUnique({ where: { id: subjectId } });
    }

    if (targetSubject && targetSubject.code.startsWith('KSLU-INT-')) {
      // Integrated common core law subject: shared across all 4 integrated programs
      where.subject = { code: targetSubject.code };
    } else {
      if (courseId) where.courseId = courseId;
      if (semesterId) where.semesterId = semesterId;
      if (subjectId) where.subjectId = subjectId;
    }

    if (schemeId) where.schemeId = schemeId;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { subject: { name: { contains: search } } }
      ];
    }

    let orderBy = {};
    if (sortBy === 'upvotes') {
      orderBy = { upvotesCount: 'desc' };
    } else if (sortBy === 'downloads') {
      orderBy = { downloadCount: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [total, items] = await Promise.all([
      prisma.studyMaterial.count({ where }),
      prisma.studyMaterial.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          course: { select: { id: true, name: true, code: true } },
          semester: { select: { id: true, semesterNumber: true, title: true } },
          subject: { select: { id: true, name: true, code: true } },
          scheme: { select: { id: true, name: true, code: true } },
          uploadedBy: { select: { id: true, fullName: true, collegeName: true } }
        }
      })
    ]);

    // Attach user bookmark and vote status if authenticated
    let enrichedItems = items;
    if (req.user) {
      const [userBookmarks, userVotes] = await Promise.all([
        prisma.bookmark.findMany({
          where: {
            userId: req.user.id,
            itemType: 'STUDY_MATERIAL',
            studyMaterialId: { in: items.map(i => i.id) }
          },
          select: { studyMaterialId: true }
        }),
        prisma.vote.findMany({
          where: {
            userId: req.user.id,
            studyMaterialId: { in: items.map(i => i.id) }
          },
          select: { studyMaterialId: true, voteType: true }
        })
      ]);

      const bookmarkedIds = new Set(userBookmarks.map(b => b.studyMaterialId));
      const voteMap = new Map(userVotes.map(v => [v.studyMaterialId, v.voteType]));

      enrichedItems = items.map(item => ({
        ...item,
        isBookmarked: bookmarkedIds.has(item.id),
        userVote: voteMap.get(item.id) || null
      }));
    }

    return paginatedResponse(res, enrichedItems, total, pageNum, limitNum, 'Study materials retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.studyMaterial.findUnique({
      where: { id },
      include: {
        course: true,
        semester: true,
        subject: true,
        scheme: true,
        uploadedBy: { select: { id: true, fullName: true, collegeName: true, role: true } },
        approvedBy: { select: { id: true, fullName: true, role: true } }
      }
    });

    if (!note) {
      return errorResponse(res, 'Study material not found.', 404);
    }

    // Only author or admin can view non-approved notes
    if (note.status !== 'APPROVED') {
      if (!req.user || (req.user.id !== note.uploadedById && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')) {
        return errorResponse(res, 'This resource is pending administrative approval.', 403);
      }
    }

    let isBookmarked = false;
    let userVote = null;

    if (req.user) {
      const [bookmark, vote] = await Promise.all([
        prisma.bookmark.findFirst({
          where: {
            userId: req.user.id,
            itemType: 'STUDY_MATERIAL',
            studyMaterialId: id
          }
        }),
        prisma.vote.findFirst({
          where: {
            userId: req.user.id,
            studyMaterialId: id
          }
        })
      ]);
      isBookmarked = !!bookmark;
      userVote = vote ? vote.voteType : null;
    }

    return successResponse(res, { note: { ...note, isBookmarked, userVote } });
  } catch (error) {
    next(error);
  }
};

const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a PDF or document note file.', 400);
    }

    const validated = noteUploadSchema.parse(req.body);

    const uploaded = await uploadFile(req.file, 'notes');

    const note = await prisma.studyMaterial.create({
      data: {
        title: validated.title,
        description: validated.description,
        courseId: validated.courseId,
        semesterId: validated.semesterId,
        subjectId: validated.subjectId,
        schemeId: validated.schemeId || null,
        category: validated.category || 'STUDY_NOTES',
        tags: validated.tags || null,
        fileUrl: uploaded.fileUrl,
        filePublicId: uploaded.filePublicId,
        fileSize: uploaded.fileSize,
        fileType: uploaded.fileType,
        status: 'PENDING',
        uploadedById: req.user.id
      },
      include: {
        course: true,
        semester: true,
        subject: true
      }
    });

    // Notify user of submission
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Study Note Submitted for Review',
        message: `Your note "${note.title}" has been submitted for moderator review. You will be notified upon approval.`,
        type: 'SYSTEM',
        linkUrl: `/dashboard/contributions`
      }
    });

    await recordAuditLog(req.user.id, 'NOTE_SUBMITTED', 'StudyMaterial', note.id, { title: note.title }, req);

    return successResponse(res, { note }, 'Study note submitted successfully. It will be publicly visible once approved by a moderator.', 201);
  } catch (error) {
    next(error);
  }
};

const mySubmissions = async (req, res, next) => {
  try {
    const notes = await prisma.studyMaterial.findMany({
      where: { uploadedById: req.user.id },
      include: {
        course: { select: { name: true, code: true } },
        semester: { select: { title: true } },
        subject: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, { notes });
  } catch (error) {
    next(error);
  }
};

const voteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // "UPVOTE" or "DOWNVOTE"
    const userId = req.user.id;

    if (!['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return errorResponse(res, 'Invalid vote type. Must be UPVOTE or DOWNVOTE.', 400);
    }

    const note = await prisma.studyMaterial.findUnique({ where: { id } });
    if (!note) {
      return errorResponse(res, 'Study material not found.', 404);
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_studyMaterialId: {
          userId,
          studyMaterialId: id
        }
      }
    });

    let newUpvotes = note.upvotesCount;
    let newDownvotes = note.downvotesCount;
    let currentVote = null;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off existing vote
        await prisma.vote.delete({ where: { id: existingVote.id } });
        if (voteType === 'UPVOTE') newUpvotes = Math.max(0, newUpvotes - 1);
        else newDownvotes = Math.max(0, newDownvotes - 1);
        currentVote = null;
      } else {
        // Switch vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType }
        });
        if (voteType === 'UPVOTE') {
          newUpvotes += 1;
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          newUpvotes = Math.max(0, newUpvotes - 1);
        }
        currentVote = voteType;
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId,
          studyMaterialId: id,
          voteType
        }
      });
      if (voteType === 'UPVOTE') newUpvotes += 1;
      else newDownvotes += 1;
      currentVote = voteType;
    }

    const updated = await prisma.studyMaterial.update({
      where: { id },
      data: {
        upvotesCount: newUpvotes,
        downvotesCount: newDownvotes
      }
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

const toggleNoteBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        itemType: 'STUDY_MATERIAL',
        studyMaterialId: id
      }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return successResponse(res, { isBookmarked: false }, 'Removed from bookmarks.');
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          itemType: 'STUDY_MATERIAL',
          studyMaterialId: id
        }
      });
      return successResponse(res, { isBookmarked: true }, 'Saved to bookmarks.');
    }
  } catch (error) {
    next(error);
  }
};

const downloadNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.studyMaterial.findUnique({ where: { id } });
    if (!note) {
      return errorResponse(res, 'Study material not found.', 404);
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await Promise.all([
      prisma.studyMaterial.update({
        where: { id },
        data: { downloadCount: { increment: 1 } }
      }),
      prisma.downloadLog.create({
        data: {
          userId: req.user?.id || null,
          itemType: 'STUDY_MATERIAL',
          studyMaterialId: id,
          ipAddress: ipAddress ? String(ipAddress) : null,
          userAgent: userAgent ? String(userAgent) : null
        }
      })
    ]);

    if (note.fileUrl.startsWith('/uploads/')) {
      const relativePath = note.fileUrl.replace('/uploads/', '');
      const fullPath = path.resolve(__dirname, '../../uploads', relativePath);
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
        return fs.createReadStream(fullPath).pipe(res);
      }
    }

    return successResponse(res, { downloadUrl: note.fileUrl }, 'Download URL generated.');
  } catch (error) {
    next(error);
  }
};

const reportNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return errorResponse(res, 'Please specify a reason for the report.', 400);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        itemType: 'STUDY_MATERIAL',
        studyMaterialId: id,
        reason,
        details: details || null,
        status: 'PENDING'
      }
    });

    await recordAuditLog(req.user.id, 'NOTE_REPORTED', 'StudyMaterial', id, { reason }, req);

    return successResponse(res, { report }, 'Thank you. The resource has been flagged for administrative review.', 201);
  } catch (error) {
    next(error);
  }
};

const getCategoryCounts = async (req, res, next) => {
  try {
    const { courseId, semesterId, subjectId } = req.query;

    const where = { status: 'APPROVED' };

    let targetSubject = null;
    if (subjectId) {
      targetSubject = await prisma.subject.findUnique({ where: { id: subjectId } });
    }

    if (targetSubject && targetSubject.code.startsWith('KSLU-INT-')) {
      where.subject = { code: targetSubject.code };
    } else {
      if (courseId) where.courseId = courseId;
      if (semesterId) where.semesterId = semesterId;
      if (subjectId) where.subjectId = subjectId;
    }

    const groups = await prisma.studyMaterial.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true
      }
    });

    const counts = {
      STUDY_NOTES: 0,
      IMPORTANT_QUESTIONS: 0,
      REFERENCE_BOOKS: 0,
      CASE_LAWS: 0,
      TOTAL: 0
    };

    let total = 0;
    groups.forEach((g) => {
      const cat = g.category || 'STUDY_NOTES';
      if (counts.hasOwnProperty(cat)) {
        counts[cat] = g._count.id;
      }
      total += g._count.id;
    });
    counts.TOTAL = total;

    return successResponse(res, { counts });
  } catch (error) {
    next(error);
  }
};

// Admin Moderation Controllers
const adminListNotes = async (req, res, next) => {
  try {
    const { status, courseId, semesterId, subjectId, category, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;

    if (subjectId) {
      const targetSub = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (targetSub && targetSub.code.startsWith('KSLU-INT-')) {
        where.subject = { code: targetSub.code };
      } else {
        where.subjectId = subjectId;
        if (courseId) where.courseId = courseId;
        if (semesterId) where.semesterId = semesterId;
      }
    } else {
      if (courseId) where.courseId = courseId;
      if (semesterId) where.semesterId = semesterId;
    }

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.studyMaterial.count({ where }),
      prisma.studyMaterial.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { id: true, name: true, code: true } },
          semester: { select: { id: true, semesterNumber: true, title: true } },
          subject: { select: { id: true, name: true, code: true } },
          uploadedBy: { select: { id: true, fullName: true, email: true, collegeName: true } },
          approvedBy: { select: { id: true, fullName: true } }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Admin notes retrieved.');
  } catch (error) {
    next(error);
  }
};

const adminApproveNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const note = await prisma.studyMaterial.findUnique({
      where: { id },
      include: { uploadedBy: true }
    });

    if (!note) {
      return errorResponse(res, 'Study material not found.', 404);
    }

    const updated = await prisma.studyMaterial.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: req.user.id,
        approvedAt: new Date(),
        rejectionReason: null
      }
    });

    // Notify the author in-app & via socket
    const notification = await prisma.notification.create({
      data: {
        userId: note.uploadedById,
        title: 'Note Approved and Published!',
        message: `Your study material "${note.title}" has been approved by the moderators and is now live on KSLU Circle.`,
        type: 'APPROVAL',
        linkUrl: `/notes/${note.id}`
      }
    });

    emitToUser(note.uploadedById, 'notification', notification);
    await recordAuditLog(req.user.id, 'NOTE_APPROVED', 'StudyMaterial', note.id, { title: note.title }, req);

    return successResponse(res, { note: updated }, 'Study note approved successfully.');
  } catch (error) {
    next(error);
  }
};

const adminRejectNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return errorResponse(res, 'Please provide a reason for rejection.', 400);
    }

    const note = await prisma.studyMaterial.findUnique({
      where: { id },
      include: { uploadedBy: true }
    });

    if (!note) {
      return errorResponse(res, 'Study material not found.', 404);
    }

    const updated = await prisma.studyMaterial.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedById: req.user.id,
        approvedAt: new Date()
      }
    });

    // Notify the author
    const notification = await prisma.notification.create({
      data: {
        userId: note.uploadedById,
        title: 'Note Submission Update',
        message: `Your submission "${note.title}" was not approved. Reason: ${reason}`,
        type: 'REJECTION',
        linkUrl: `/dashboard/contributions`
      }
    });

    emitToUser(note.uploadedById, 'notification', notification);
    await recordAuditLog(req.user.id, 'NOTE_REJECTED', 'StudyMaterial', note.id, { reason }, req);

    return successResponse(res, { note: updated }, 'Study note rejected.');
  } catch (error) {
    next(error);
  }
};

// Validate academic hierarchy
const validateAcademicHierarchy = async (courseId, semesterId, subjectId) => {
  const [course, semester, subject] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.semester.findUnique({ where: { id: semesterId } }),
    prisma.subject.findUnique({ where: { id: subjectId } })
  ]);

  if (!course) throw new Error('Selected course does not exist.');
  if (!semester) throw new Error('Selected semester does not exist.');
  if (!subject) throw new Error('Selected subject does not exist.');

  if (semester.courseId !== courseId) {
    throw new Error('Semester does not belong to the selected course.');
  }

  if (subject.courseId !== courseId || subject.semesterId !== semesterId) {
    throw new Error('Subject does not belong to the selected course and semester.');
  }

  return { course, semester, subject };
};

const adminCreateResource = async (req, res, next) => {
  try {
    const validated = adminResourceSchema.parse(req.body);

    // Validate hierarchy
    try {
      await validateAcademicHierarchy(validated.courseId, validated.semesterId, validated.subjectId);
    } catch (hierarchyErr) {
      return errorResponse(res, hierarchyErr.message, 400);
    }

    let fileUrl = validated.fileUrl;
    let filePublicId = null;
    let fileSize = 0;
    let fileType = 'application/pdf';
    let isExternalLink = validated.isExternalLink || false;

    if (req.file) {
      const uploaded = await uploadFile(req.file, 'notes');
      fileUrl = uploaded.fileUrl;
      filePublicId = uploaded.filePublicId;
      fileSize = uploaded.fileSize;
      fileType = uploaded.fileType;
      isExternalLink = false;
    } else if (!fileUrl) {
      return errorResponse(res, 'Please provide an uploaded PDF or an external resource link.', 400);
    }

    const note = await prisma.studyMaterial.create({
      data: {
        title: validated.title,
        description: validated.description,
        courseId: validated.courseId,
        semesterId: validated.semesterId,
        subjectId: validated.subjectId,
        schemeId: validated.schemeId || null,
        category: validated.category,
        isExternalLink,
        tags: validated.tags || null,
        fileUrl,
        filePublicId,
        fileSize,
        fileType,
        status: validated.status || 'APPROVED',
        approvedById: req.user.id,
        approvedAt: new Date(),
        uploadedById: req.user.id
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, semesterNumber: true, title: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });

    await recordAuditLog(req.user.id, 'RESOURCE_CREATED', 'StudyMaterial', note.id, { title: note.title, category: note.category }, req);

    return successResponse(res, { note }, 'Study resource created and published successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminUpdateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.studyMaterial.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Resource not found.', 404);
    }

    const {
      title,
      description,
      courseId,
      semesterId,
      subjectId,
      schemeId,
      category,
      status,
      isExternalLink,
      fileUrl,
      tags
    } = req.body;

    const targetCourseId = courseId || existing.courseId;
    const targetSemesterId = semesterId || existing.semesterId;
    const targetSubjectId = subjectId || existing.subjectId;

    if (courseId || semesterId || subjectId) {
      try {
        await validateAcademicHierarchy(targetCourseId, targetSemesterId, targetSubjectId);
      } catch (hierarchyErr) {
        return errorResponse(res, hierarchyErr.message, 400);
      }
    }

    let updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(courseId && { courseId }),
      ...(semesterId && { semesterId }),
      ...(subjectId && { subjectId }),
      ...(schemeId !== undefined && { schemeId: schemeId || null }),
      ...(category && { category }),
      ...(status && { status }),
      ...(tags !== undefined && { tags: tags || null })
    };

    if (req.file) {
      const uploaded = await uploadFile(req.file, 'notes');
      updateData.fileUrl = uploaded.fileUrl;
      updateData.filePublicId = uploaded.filePublicId;
      updateData.fileSize = uploaded.fileSize;
      updateData.fileType = uploaded.fileType;
      updateData.isExternalLink = false;
    } else if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl;
      if (isExternalLink !== undefined) {
        updateData.isExternalLink = Boolean(isExternalLink);
      }
    }

    const updated = await prisma.studyMaterial.update({
      where: { id },
      data: updateData,
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, semesterNumber: true, title: true } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });

    await recordAuditLog(req.user.id, 'RESOURCE_UPDATED', 'StudyMaterial', id, { title: updated.title }, req);

    return successResponse(res, { note: updated }, 'Resource updated successfully.');
  } catch (error) {
    next(error);
  }
};

const adminDeleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.studyMaterial.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Resource not found.', 404);
    }

    if (existing.fileUrl && existing.fileUrl.startsWith('/uploads/')) {
      const filePath = path.resolve(__dirname, '../../uploads', existing.fileUrl.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    await prisma.studyMaterial.delete({ where: { id } });

    await recordAuditLog(req.user.id, 'RESOURCE_DELETED', 'StudyMaterial', id, { title: existing.title }, req);

    return successResponse(res, null, 'Resource deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listNotes,
  getCategoryCounts,
  getNoteById,
  uploadNote,
  mySubmissions,
  voteNote,
  toggleNoteBookmark,
  downloadNote,
  reportNote,
  adminListNotes,
  adminApproveNote,
  adminRejectNote,
  adminCreateResource,
  adminUpdateResource,
  adminDeleteResource
};
