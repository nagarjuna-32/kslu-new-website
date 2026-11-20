const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', announcementsController.listAnnouncements);
router.get('/:slug', announcementsController.getAnnouncementBySlug);

// Admin routes
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), announcementsController.adminCreateAnnouncement);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), announcementsController.adminUpdateAnnouncement);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), announcementsController.adminDeleteAnnouncement);

module.exports = router;
