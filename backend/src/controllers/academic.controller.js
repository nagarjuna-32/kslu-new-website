const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { courseSchema, subjectSchema } = require('../validators');
const { recordAuditLog } = require('../middleware/audit.middleware');

const getCourses = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
          select: { id: true, semesterNumber: true, title: true }
        },
        _count: {
          select: {
            subjects: true,
            questionPapers: true,
            studyMaterials: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    return successResponse(res, { courses });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        semesters: {
          orderBy: { semesterNumber: 'asc' },
          include: {
            subjects: {
              orderBy: { code: 'asc' }
            }
          }
        }
      }
    });

    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    return successResponse(res, { course });
  } catch (error) {
    next(error);
  }
};

const getSemestersByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const semesters = await prisma.semester.findMany({
      where: { courseId },
      orderBy: { semesterNumber: 'asc' },
      include: {
        _count: {
          select: { subjects: true, questionPapers: true, studyMaterials: true }
        }
      }
    });

    return successResponse(res, { semesters });
  } catch (error) {
    next(error);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const { courseId, semesterId, search } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (semesterId) where.semesterId = semesterId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        course: { select: { id: true, code: true, name: true } },
        semester: { select: { id: true, semesterNumber: true, title: true } },
        _count: {
          select: {
            questionPapers: true,
            studyMaterials: true
          }
        }
      },
      orderBy: [{ courseId: 'asc' }, { semesterId: 'asc' }, { code: 'asc' }]
    });

    return successResponse(res, { subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        course: true,
        semester: true,
        _count: {
          select: {
            questionPapers: true,
            studyMaterials: true,
            discussions: true
          }
        }
      }
    });

    if (!subject) {
      return errorResponse(res, 'Subject not found.', 404);
    }

    return successResponse(res, { subject });
  } catch (error) {
    next(error);
  }
};

const getSchemes = async (req, res, next) => {
  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: { maxMarks: 'asc' }
    });
    return successResponse(res, { schemes });
  } catch (error) {
    next(error);
  }
};

// Admin handlers
const adminCreateCourse = async (req, res, next) => {
  try {
    const validated = courseSchema.parse(req.body);
    const existing = await prisma.course.findUnique({ where: { code: validated.code } });
    if (existing) {
      return errorResponse(res, 'A course with this code already exists.', 400);
    }

    const course = await prisma.course.create({
      data: validated
    });

    // Auto-create semesters
    for (let i = 1; i <= course.totalSemesters; i++) {
      await prisma.semester.create({
        data: {
          courseId: course.id,
          semesterNumber: i,
          title: `Semester ${i}`
        }
      });
    }

    await recordAuditLog(req.user.id, 'COURSE_CREATED', 'Course', course.id, { name: course.name }, req);
    return successResponse(res, { course }, 'Course created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminCreateSubject = async (req, res, next) => {
  try {
    const validated = subjectSchema.parse(req.body);

    const subject = await prisma.subject.create({
      data: validated
    });

    await recordAuditLog(req.user.id, 'SUBJECT_CREATED', 'Subject', subject.id, { name: subject.name, code: subject.code }, req);
    return successResponse(res, { subject }, 'Subject created successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const adminUpdateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = subjectSchema.partial().parse(req.body);

    const subject = await prisma.subject.update({
      where: { id },
      data: validated
    });

    await recordAuditLog(req.user.id, 'SUBJECT_UPDATED', 'Subject', subject.id, validated, req);
    return successResponse(res, { subject }, 'Subject updated successfully.');
  } catch (error) {
    next(error);
  }
};

const adminDeleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    await recordAuditLog(req.user.id, 'SUBJECT_DELETED', 'Subject', id, null, req);
    return successResponse(res, null, 'Subject deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getSemestersByCourse,
  getSubjects,
  getSubjectById,
  getSchemes,
  adminCreateCourse,
  adminCreateSubject,
  adminUpdateSubject,
  adminDeleteSubject
};
