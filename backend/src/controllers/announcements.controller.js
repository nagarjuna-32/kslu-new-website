const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { announcementSchema } = require('../validators');
const { broadcastEvent } = require('../services/socket.service');
const { recordAuditLog } = require('../middleware/audit.middleware');

const listAnnouncements = async (req, res, next) => {
  try {
    const { category, isImportant, search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = { isActive: true };
    if (category) where.category = category;
    if (isImportant !== undefined) where.isImportant = isImportant === 'true';

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ isImportant: 'desc' }, { publishedAt: 'desc' }],
        include: {
          author: { select: { fullName: true } }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Announcements retrieved.');
  } catch (error) {
    next(error);
  }
};

const getAnnouncementBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const item = await prisma.announcement.findUnique({
      where: { slug },
      include: { author: { select: { fullName: true } } }
    });

    if (!item) return errorResponse(res, 'Announcement not found.', 404);

    return successResponse(res, { announcement: item });
  } catch (error) {
    next(error);
  }
};

const adminCreateAnnouncement = async (req, res, next) => {
  try {
    const validated = announcementSchema.parse(req.body);

    const slug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const announcement = await prisma.announcement.create({
      data: {
        ...validated,
        slug,
        authorId: req.user.id
      }
    });

    if (announcement.isImportant) {
      broadcastEvent('announcement', {
        id: announcement.id,
        title: announcement.title,
        category: announcement.category,
        slug: announcement.slug
      });
    }

    await recordAuditLog(req.user.id, 'ANNOUNCEMENT_CREATED', 'Announcement', announcement.id, { title: announcement.title }, req);
    return successResponse(res, { announcement }, 'Announcement published successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminUpdateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = announcementSchema.partial().parse(req.body);

    const announcement = await prisma.announcement.update({
      where: { id },
      data: validated
    });

    await recordAuditLog(req.user.id, 'ANNOUNCEMENT_UPDATED', 'Announcement', id, validated, req);
    return successResponse(res, { announcement }, 'Announcement updated.');
  } catch (error) {
    next(error);
  }
};

const adminDeleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id } });
    await recordAuditLog(req.user.id, 'ANNOUNCEMENT_DELETED', 'Announcement', id, null, req);
    return successResponse(res, null, 'Announcement deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAnnouncements,
  getAnnouncementBySlug,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
  adminDeleteAnnouncement
};
