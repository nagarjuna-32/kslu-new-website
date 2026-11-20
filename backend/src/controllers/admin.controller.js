const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { recordAuditLog } = require('../middleware/audit.middleware');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalPYQs,
      totalNotes,
      pendingNotes,
      approvedNotes,
      totalDownloads,
      recentDiscussions,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.questionPaper.count(),
      prisma.studyMaterial.count(),
      prisma.studyMaterial.count({ where: { status: 'PENDING' } }),
      prisma.studyMaterial.count({ where: { status: 'APPROVED' } }),
      prisma.downloadLog.count(),
      prisma.discussion.count(),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true, role: true } } }
      })
    ]);

    // Breakdown by course
    const courseStats = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        _count: {
          select: {
            questionPapers: true,
            studyMaterials: true,
            users: true
          }
        }
      }
    });

    return successResponse(res, {
      stats: {
        totalStudents,
        totalPYQs,
        totalNotes,
        pendingNotes,
        approvedNotes,
        totalDownloads,
        recentDiscussions
      },
      courseStats,
      recentAuditLogs
    });
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { collegeName: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          collegeName: true,
          course: { select: { name: true, code: true } },
          semester: { select: { title: true } },
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              studyMaterials: true,
              discussions: true,
              comments: true
            }
          }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Users retrieved.');
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // SUPERADMIN only can change roles
    if (req.user.role !== 'SUPERADMIN') {
      return errorResponse(res, 'Only the Super Administrator can update user roles.', 403);
    }

    if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      return errorResponse(res, 'Invalid role specified.', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return errorResponse(res, 'User not found.', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true }
    });

    await recordAuditLog(req.user.id, 'USER_ROLE_CHANGED', 'User', id, { from: targetUser.role, to: role }, req);
    return successResponse(res, { user: updated }, `User role updated to ${role}.`);
  } catch (error) {
    next(error);
  }
};

const listReports = async (req, res, next) => {
  try {
    const { status = 'PENDING', page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status !== 'ALL') where.status = status;

    const [total, items] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { fullName: true, email: true } },
          resolver: { select: { fullName: true } },
          studyMaterial: { select: { id: true, title: true, fileUrl: true } },
          discussion: { select: { id: true, title: true } },
          comment: { select: { id: true, content: true } }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Reports retrieved.');
  } catch (error) {
    next(error);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body; // RESOLVED or DISMISSED

    if (!['RESOLVED', 'DISMISSED'].includes(status)) {
      return errorResponse(res, 'Status must be RESOLVED or DISMISSED.', 400);
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolutionNotes: resolutionNotes || null,
        resolvedById: req.user.id,
        resolvedAt: new Date()
      }
    });

    await recordAuditLog(req.user.id, 'REPORT_RESOLVED', 'Report', id, { status, resolutionNotes }, req);
    return successResponse(res, { report: updated }, 'Report updated successfully.');
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [total, items] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true, role: true } }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Audit logs retrieved.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserRole,
  listReports,
  resolveReport,
  getAuditLogs
};
