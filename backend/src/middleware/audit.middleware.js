const prisma = require('../config/db');
const logger = require('../utils/logger');

const recordAuditLog = async (userId, action, resourceType, resourceId = null, details = null, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip) : null;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        ipAddress: ipAddress ? String(ipAddress) : null,
        details: details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : null
      }
    });
  } catch (err) {
    logger.error('Failed to write audit log:', err.message);
  }
};

module.exports = {
  recordAuditLog
};
