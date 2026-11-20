const prisma = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { careerSchema } = require('../validators');
const { recordAuditLog } = require('../middleware/audit.middleware');

const listOpportunities = async (req, res, next) => {
  try {
    const { type, search, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const where = { isActive: true };
    if (type) where.opportunityType = type;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { organization: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.careerOpportunity.count({ where }),
      prisma.careerOpportunity.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdBy: { select: { fullName: true } }
        }
      })
    ]);

    return paginatedResponse(res, items, total, pageNum, limitNum, 'Career opportunities retrieved.');
  } catch (error) {
    next(error);
  }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.careerOpportunity.findUnique({
      where: { id },
      include: { createdBy: { select: { fullName: true } } }
    });

    if (!item) return errorResponse(res, 'Career opportunity not found.', 404);

    return successResponse(res, { opportunity: item });
  } catch (error) {
    next(error);
  }
};

const adminCreateOpportunity = async (req, res, next) => {
  try {
    const validated = careerSchema.parse(req.body);

    const opp = await prisma.careerOpportunity.create({
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        createdById: req.user.id
      }
    });

    await recordAuditLog(req.user.id, 'CAREER_OPP_CREATED', 'CareerOpportunity', opp.id, { title: opp.title }, req);
    return successResponse(res, { opportunity: opp }, 'Opportunity created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminUpdateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = careerSchema.partial().parse(req.body);

    const opp = await prisma.careerOpportunity.update({
      where: { id },
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined
      }
    });

    await recordAuditLog(req.user.id, 'CAREER_OPP_UPDATED', 'CareerOpportunity', id, validated, req);
    return successResponse(res, { opportunity: opp }, 'Opportunity updated.');
  } catch (error) {
    next(error);
  }
};

const adminDeleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.careerOpportunity.delete({ where: { id } });
    await recordAuditLog(req.user.id, 'CAREER_OPP_DELETED', 'CareerOpportunity', id, null, req);
    return successResponse(res, null, 'Opportunity deleted.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listOpportunities,
  getOpportunityById,
  adminCreateOpportunity,
  adminUpdateOpportunity,
  adminDeleteOpportunity
};
