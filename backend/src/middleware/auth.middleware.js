const prisma = require('../config/db');
const { verifyToken } = require('../config/jwt');
const { errorResponse } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, 'Invalid or expired session. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        collegeName: true,
        courseId: true,
        semesterId: true,
        isEmailVerified: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401, error.message);
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            collegeName: true,
            courseId: true,
            semesterId: true
          }
        });
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (ignored) {
    // optional, continue
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized access', 401);
    }

    // SUPERADMIN always inherits ADMIN and USER permissions
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return errorResponse(res, 'Access denied. You do not have permission to perform this action.', 403);
  };
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'SUPERADMIN') {
    return errorResponse(res, 'Access restricted to Super Administrator.', 403);
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  requireSuperAdmin
};
