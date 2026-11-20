const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema } = require('../validators');
const { sendPasswordResetEmail } = require('../services/email.service');
const { recordAuditLog } = require('../middleware/audit.middleware');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() }
    });

    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: validated.fullName,
        email: validated.email.toLowerCase(),
        passwordHash,
        collegeName: validated.collegeName || null,
        courseId: validated.courseId || null,
        semesterId: validated.semesterId || null,
        phone: validated.phone || null,
        role: 'USER',
        isEmailVerified: true // Set verified by default for student convenience
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        collegeName: true,
        courseId: true,
        semesterId: true,
        createdAt: true
      }
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to KSLU Circle!',
        message: 'Your academic world is all in one circle. Access PYQs, syllabus, notes, and study discussions.',
        type: 'SYSTEM',
        linkUrl: '/dashboard'
      }
    });

    const token = generateToken({ userId: user.id, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    await recordAuditLog(user.id, 'USER_REGISTERED', 'User', user.id, { email: user.email }, req);

    return successResponse(res, { user, token }, 'Registration successful! Welcome to KSLU Circle.', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } }
      }
    });

    if (!user || !user.passwordHash) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = generateToken({ userId: user.id, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    await recordAuditLog(user.id, 'USER_LOGIN', 'User', user.id, null, req);

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      collegeName: user.collegeName,
      courseId: user.courseId,
      semesterId: user.semesterId,
      course: user.course,
      semester: user.semester
    };

    return successResponse(res, { user: sanitizedUser, token }, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { email, fullName, googleId, avatarUrl } = req.body;

    if (!email || !googleId) {
      return errorResponse(res, 'Google email and Google ID are required.', 400);
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: email.toLowerCase() }]
      },
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } }
      }
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatarUrl: avatarUrl || user.avatarUrl, lastLoginAt: new Date() },
          include: {
            course: { select: { id: true, name: true, code: true } },
            semester: { select: { id: true, title: true, semesterNumber: true } }
          }
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          fullName: fullName || 'KSLU Student',
          googleId,
          avatarUrl: avatarUrl || null,
          role: 'USER',
          isEmailVerified: true
        },
        include: {
          course: true,
          semester: true
        }
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    await recordAuditLog(user.id, 'GOOGLE_LOGIN', 'User', user.id, null, req);

    return successResponse(res, { user, token }, 'Google authentication successful.');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  return successResponse(res, null, 'Logged out successfully.');
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const sanitized = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      collegeName: user.collegeName,
      phone: user.phone,
      courseId: user.courseId,
      semesterId: user.semesterId,
      course: user.course,
      semester: user.semester,
      createdAt: user.createdAt
    };

    return successResponse(res, { user: sanitized });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const validated = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: validated,
      include: {
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true, semesterNumber: true } }
      }
    });

    return successResponse(res, { user: updated }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Return success even if not found to avoid user enumeration
      return successResponse(res, null, 'If this email is registered, a password reset link has been sent.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires
      }
    });

    await sendPasswordResetEmail(user.email, resetToken, user.fullName);
    await recordAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, null, req);

    return successResponse(res, { devToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined }, 'Password reset instructions have been dispatched.');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'Password reset token is invalid or has expired.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    await recordAuditLog(user.id, 'PASSWORD_RESET_COMPLETED', 'User', user.id, null, req);

    return successResponse(res, null, 'Your password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
