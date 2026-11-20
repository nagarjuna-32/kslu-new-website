const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize, requireSuperAdmin } = require('../middleware/auth.middleware');

// All routes require at least ADMIN
router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.put('/users/:id/role', requireSuperAdmin, adminController.updateUserRole);
router.get('/reports', adminController.listReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
