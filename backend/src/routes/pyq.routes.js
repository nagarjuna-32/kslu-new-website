const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyq.controller');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', optionalAuthenticate, pyqController.listPYQs);
router.get('/:id', optionalAuthenticate, pyqController.getPYQById);
router.get('/:id/download', optionalAuthenticate, pyqController.downloadPYQ);
router.post('/:id/bookmark', authenticate, pyqController.toggleBookmark);

// Admin routes
router.post('/upload', authenticate, authorize('ADMIN', 'SUPERADMIN'), upload.single('file'), pyqController.adminUploadPYQ);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), pyqController.adminDeletePYQ);

module.exports = router;
