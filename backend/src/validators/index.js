const { z } = require('zod');

// Auth Validators
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  collegeName: z.string().optional(),
  courseId: z.string().optional(),
  semesterId: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  collegeName: z.string().optional(),
  courseId: z.string().optional().nullable(),
  semesterId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable()
});

// Academic Validators
const courseSchema = z.object({
  code: z.string().min(2).max(30),
  name: z.string().min(2).max(150),
  durationYears: z.number().int().min(1).max(10),
  totalSemesters: z.number().int().min(1).max(20),
  description: z.string().optional()
});

const subjectSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  code: z.string().min(2, 'Subject code is required'),
  name: z.string().min(2, 'Subject name is required'),
  description: z.string().optional(),
  isCore: z.boolean().optional().default(true),
  credits: z.number().int().min(1).max(10).optional().default(4)
});

// PYQ Validators
const pyqUploadSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  schemeId: z.string().min(1, 'Marking scheme is required'),
  examYear: z.coerce.number().int().min(2010).max(2035),
  examMonth: z.string().min(2, 'Exam month is required'),
  examType: z.enum(['REGULAR', 'REVALUATION', 'SUPPLEMENTARY']).optional().default('REGULAR'),
  totalPages: z.coerce.number().int().min(1).optional().default(1)
});

// Notes Validators
const NOTE_CATEGORIES = ['STUDY_NOTES', 'IMPORTANT_QUESTIONS', 'REFERENCE_BOOKS', 'CASE_LAWS'];

const noteUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Please provide an adequate description'),
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  schemeId: z.string().optional().nullable(),
  category: z.enum(['STUDY_NOTES', 'IMPORTANT_QUESTIONS', 'REFERENCE_BOOKS', 'CASE_LAWS']).optional().default('STUDY_NOTES'),
  tags: z.string().optional().nullable()
});

const adminResourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  courseId: z.string().min(1, 'Course is required'),
  semesterId: z.string().min(1, 'Semester is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  schemeId: z.string().optional().nullable(),
  category: z.enum(['STUDY_NOTES', 'IMPORTANT_QUESTIONS', 'REFERENCE_BOOKS', 'CASE_LAWS']).optional().default('STUDY_NOTES'),
  status: z.enum(['APPROVED', 'PENDING', 'REJECTED']).optional().default('APPROVED'),
  isExternalLink: z.coerce.boolean().optional().default(false),
  fileUrl: z.string().optional().nullable(),
  tags: z.string().optional().nullable()
});

// Community Validators
const discussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  courseId: z.string().optional().nullable(),
  semesterId: z.string().optional().nullable(),
  subjectId: z.string().optional().nullable()
});

const commentSchema = z.object({
  content: z.string().min(2, 'Comment must not be empty'),
  parentCommentId: z.string().optional().nullable()
});

// Career Validators
const careerSchema = z.object({
  title: z.string().min(3),
  organization: z.string().min(2),
  opportunityType: z.enum(['INTERNSHIP', 'MOOT_COURT', 'RESEARCH', 'WORKSHOP', 'ALUMNI_JOB', 'COMPETITION']),
  location: z.string().min(2),
  stipend: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  applyUrl: z.string().url().optional().nullable().or(z.literal('')),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  description: z.string().min(10),
  eligibility: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false)
});

// Announcement Validators
const announcementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  category: z.enum(['EXAMINATION', 'TIMETABLE', 'RESULTS', 'ACADEMIC_CALENDAR', 'UNIVERSITY_CIRCULAR', 'COMPETITION']),
  isImportant: z.boolean().optional().default(false),
  officialSourceUrl: z.string().url().optional().nullable().or(z.literal(''))
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  courseSchema,
  subjectSchema,
  pyqUploadSchema,
  noteUploadSchema,
  adminResourceSchema,
  NOTE_CATEGORIES,
  discussionSchema,
  commentSchema,
  careerSchema,
  announcementSchema
};
