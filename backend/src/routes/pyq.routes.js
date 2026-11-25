const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyq.controller');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public / Student routes
router.get('/', optionalAuthenticate, pyqController.listPYQs);

// Google Drive Sync Admin routes (defined before :id)
router.get('/sync/status', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.getSyncStatus);
router.get('/sync/scan-report', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.getScanReport);
router.post('/sync/full', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.triggerFullSync);
router.post('/sync/cancel', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.cancelSync);

// Details, Preview Stream & Download routes
router.get('/:id', optionalAuthenticate, pyqController.getPYQById);
router.get('/:id/stream', optionalAuthenticate, pyqController.streamPYQ);
router.get('/:id/download', optionalAuthenticate, pyqController.downloadPYQ);
router.post('/:id/bookmark', authenticate, pyqController.toggleBookmark);

// Admin routes
router.post('/upload', authenticate, authorize('ADMIN', 'SUPERADMIN'), upload.single('file'), pyqController.adminUploadPYQ);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.adminDeletePYQ);

module.exports = router;
