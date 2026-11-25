const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { pyqUploadSchema } = require('../validators');
const { uploadFile, deleteFile } = require('../services/file.service');
const { recordAuditLog } = require('../middleware/audit.middleware');
const googleDriveService = require('../services/googleDriveService');
const pyqSyncService = require('../services/pyqSyncService');
const logger = require('../utils/logger');

const listPYQs = async (req, res, next) => {
  try {
    const {
      courseId,
      semesterId,
      subjectId,
      schemeId,
      examYear,
      examType,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where = { isVerified: true };

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

    if (schemeId) where.schemeId = schemeId;
    if (examYear) where.examYear = parseInt(examYear, 10);
    if (examType) where.examType = examType;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { name: { contains: search } } },
        { subject: { code: { contains: search } } }
      ];
    }

    let orderBy = {};
    if (sortBy === 'examYear') {
      orderBy = { examYear: order.toLowerCase() === 'asc' ? 'asc' : 'desc' };
    } else if (sortBy === 'downloads') {
      orderBy = { downloadCount: 'desc' };
    } else if (sortBy === 'views') {
      orderBy = { viewCount: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [total, items] = await Promise.all([
      prisma.questionPaper.count({ where }),
      prisma.questionPaper.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          course: { select: { id: true, name: true, code: true } },
          semester: { select: { id: true, semesterNumber: true, title: true } },
          subject: { select: { id: true, name: true, code: true } },
          scheme: { select: { id: true, name: true, code: true, maxMarks: true } }
        }
      })
    ]);

    // If user is authenticated, attach isBookmarked flag
    let enrichedItems = items;
    if (req.user) {
      const userBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: req.user.id,
          itemType: 'PYQ',
          questionPaperId: { in: items.map(i => i.id) }
        },
        select: { questionPaperId: true }
      });
      const bookmarkedIds = new Set(userBookmarks.map(b => b.questionPaperId));
      enrichedItems = items.map(item => ({
        ...item,
        isBookmarked: bookmarkedIds.has(item.id)
      }));
    }

    return paginatedResponse(res, enrichedItems, total, pageNum, limitNum, 'Question papers retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

const getPYQById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pyq = await prisma.questionPaper.findUnique({
      where: { id },
      include: {
        course: true,
        semester: true,
        subject: true,
        scheme: true,
        uploadedBy: { select: { id: true, fullName: true, role: true } }
      }
    });

    if (!pyq) {
      return errorResponse(res, 'Question paper not found.', 404);
    }

    // Increment view count
    await prisma.questionPaper.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    let isBookmarked = false;
    if (req.user) {
      const bookmark = await prisma.bookmark.findFirst({
        where: {
          userId: req.user.id,
          itemType: 'PYQ',
          questionPaperId: id
        }
      });
      isBookmarked = !!bookmark;
    }

    return successResponse(res, { pyq: { ...pyq, isBookmarked } });
  } catch (error) {
    next(error);
  }
};

const downloadPYQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pyq = await prisma.questionPaper.findUnique({
      where: { id }
    });

    if (!pyq) {
      return errorResponse(res, 'Question paper not found.', 404);
    }

    if (!pyq.isAvailable) {
      return errorResponse(res, 'This question paper is temporarily unavailable.', 404);
    }

    // Increment download count and record download log
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await Promise.all([
      prisma.questionPaper.update({
        where: { id },
        data: { downloadCount: { increment: 1 } }
      }),
      prisma.downloadLog.create({
        data: {
          userId: req.user?.id || null,
          itemType: 'PYQ',
          questionPaperId: id,
          ipAddress: ipAddress ? String(ipAddress) : null,
          userAgent: userAgent ? String(userAgent) : null
        }
      })
    ]);

    // 1. Google Drive PDF Download
    if (pyq.driveFileId) {
      try {
        const driveStream = await googleDriveService.streamFile(pyq.driveFileId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(pyq.title.replace(/[^a-zA-Z0-9_\-\.\s]/g, '_'))}.pdf"`);
        return driveStream.stream.pipe(res);
      } catch (driveErr) {
        logger.error(`Failed to download Google Drive file ${pyq.driveFileId}: ${driveErr.message}`);
        return errorResponse(res, 'Unable to download file from Google Drive.', 502);
      }
    }

    // 2. Handle local file vs external URL
    if (pyq.fileUrl.startsWith('/uploads/')) {
      const relativePath = pyq.fileUrl.replace('/uploads/', '');
      const fullPath = path.resolve(__dirname, '../../uploads', relativePath);
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pyq.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
        return fs.createReadStream(fullPath).pipe(res);
      }
    }

    return successResponse(res, { downloadUrl: pyq.fileUrl }, 'Download URL generated.');
  } catch (error) {
    next(error);
  }
};

// Stream PYQ PDF inline for preview (Supporting Google Drive & local uploads with HTTP Range requests)
const streamPYQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pyq = await prisma.questionPaper.findUnique({
      where: { id }
    });

    if (!pyq) {
      return errorResponse(res, 'Question paper not found.', 404);
    }

    if (!pyq.isAvailable) {
      return errorResponse(res, 'This question paper is temporarily unavailable.', 404);
    }

    // Increment view count
    await prisma.questionPaper.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    // 1. Google Drive PDF Streaming
    if (pyq.driveFileId) {
      try {
        const rangeHeader = req.headers.range || null;
        const driveStream = await googleDriveService.streamFile(pyq.driveFileId, rangeHeader);

        res.status(driveStream.status || 200);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pyq.title || 'QuestionPaper')}.pdf"`);

        if (driveStream.headers['content-range']) {
          res.setHeader('Content-Range', driveStream.headers['content-range']);
        }
        if (driveStream.headers['content-length']) {
          res.setHeader('Content-Length', driveStream.headers['content-length']);
        }

        return driveStream.stream.pipe(res);
      } catch (driveErr) {
        logger.error(`Failed to stream Google Drive file ${pyq.driveFileId}: ${driveErr.message}`);
        return errorResponse(res, 'Unable to stream file from Google Drive.', 502);
      }
    }

    // 2. Local uploads streaming
    if (pyq.fileUrl && pyq.fileUrl.startsWith('/uploads/')) {
      const relativePath = pyq.fileUrl.replace('/uploads/', '');
      const fullPath = path.resolve(__dirname, '../../uploads', relativePath);
      if (fs.existsSync(fullPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(pyq.title)}.pdf"`);
        return fs.createReadStream(fullPath).pipe(res);
      }
    }

    // 3. Fallback to redirecting to external URL
    if (pyq.fileUrl && pyq.fileUrl.startsWith('http')) {
      return res.redirect(pyq.fileUrl);
    }

    return errorResponse(res, 'File content could not be located.', 404);
  } catch (error) {
    next(error);
  }
};

// Admin: Get Drive sync status and stats
const getSyncStatus = async (req, res, next) => {
  try {
    const status = await pyqSyncService.getSyncStatus();
    return successResponse(res, status);
  } catch (error) {
    next(error);
  }
};

// Admin: Read-only scan report of detected folders and PDFs
const getScanReport = async (req, res, next) => {
  try {
    const report = await pyqSyncService.runDryRunScan();
    return successResponse(res, report, 'Google Drive read-only scan completed successfully.');
  } catch (error) {
    next(error);
  }
};

// Admin: Trigger full sync
const triggerFullSync = async (req, res, next) => {
  try {
    if (await pyqSyncService.isRunning()) {
      return errorResponse(res, 'A synchronization job is already actively running.', 409);
    }

    // Start sync in background so HTTP request does not time out
    pyqSyncService.runFullSync(req.user.id).catch(err => {
      logger.error('Background PYQ sync failed: ' + err.message);
    });

    return successResponse(res, null, 'Google Drive PYQ synchronization started in background.', 202);
  } catch (error) {
    next(error);
  }
};

// Admin: Cancel sync
const cancelSync = async (req, res, next) => {
  try {
    const cancelled = pyqSyncService.cancelSync();
    if (cancelled) {
      return successResponse(res, null, 'Cancellation signal sent to sync job.');
    }
    return successResponse(res, null, 'No active sync job was running.');
  } catch (error) {
    next(error);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        itemType: 'PYQ',
        questionPaperId: id
      }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return successResponse(res, { isBookmarked: false }, 'Removed from bookmarks.');
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          itemType: 'PYQ',
          questionPaperId: id
        }
      });
      return successResponse(res, { isBookmarked: true }, 'Saved to bookmarks.');
    }
  } catch (error) {
    next(error);
  }
};

// Admin upload PYQ
const adminUploadPYQ = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please select a PDF question paper to upload.', 400);
    }

    const validated = pyqUploadSchema.parse(req.body);

    const uploaded = await uploadFile(req.file, 'pyqs');

    const pyq = await prisma.questionPaper.create({
      data: {
        title: validated.title,
        courseId: validated.courseId,
        semesterId: validated.semesterId,
        subjectId: validated.subjectId,
        schemeId: validated.schemeId,
        examYear: validated.examYear,
        examMonth: validated.examMonth,
        examType: validated.examType || 'REGULAR',
        totalPages: validated.totalPages || 1,
        fileUrl: uploaded.fileUrl,
        filePublicId: uploaded.filePublicId,
        fileSize: uploaded.fileSize,
        fileType: uploaded.fileType,
        uploadedById: req.user.id,
        isVerified: true
      },
      include: {
        course: true,
        semester: true,
        subject: true,
        scheme: true
      }
    });

    await recordAuditLog(req.user.id, 'PYQ_UPLOADED', 'QuestionPaper', pyq.id, { title: pyq.title }, req);

    return successResponse(res, { pyq }, 'Question paper uploaded successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminDeletePYQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pyq = await prisma.questionPaper.findUnique({ where: { id } });
    if (!pyq) {
      return errorResponse(res, 'Question paper not found.', 404);
    }

    await deleteFile(pyq.fileUrl, pyq.filePublicId);
    await prisma.questionPaper.delete({ where: { id } });

    await recordAuditLog(req.user.id, 'PYQ_DELETED', 'QuestionPaper', id, { title: pyq.title }, req);
    return successResponse(res, null, 'Question paper deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPYQs,
  getPYQById,
  downloadPYQ,
  streamPYQ,
  toggleBookmark,
  adminUploadPYQ,
  adminDeletePYQ,
  getSyncStatus,
  getScanReport,
  triggerFullSync,
  cancelSync
};
