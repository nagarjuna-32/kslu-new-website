const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticate, optionalAuthenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', optionalAuthenticate, notesController.listNotes);
router.get('/categories-count', notesController.getCategoryCounts);
router.get('/my-submissions', authenticate, notesController.mySubmissions);
router.get('/:id', optionalAuthenticate, notesController.getNoteById);
router.post('/upload', authenticate, upload.single('file'), notesController.uploadNote);
router.post('/:id/vote', authenticate, notesController.voteNote);
router.post('/:id/bookmark', authenticate, notesController.toggleNoteBookmark);
router.get('/:id/download', optionalAuthenticate, notesController.downloadNote);
router.post('/:id/report', authenticate, notesController.reportNote);

// Admin Moderation and Resource Management routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPERADMIN'), notesController.adminListNotes);
router.post('/admin/resource', authenticate, authorize('ADMIN', 'SUPERADMIN'), upload.single('file'), notesController.adminCreateResource);
router.put('/admin/resource/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), upload.single('file'), notesController.adminUpdateResource);
router.delete('/admin/resource/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), notesController.adminDeleteResource);
router.post('/admin/:id/approve', authenticate, authorize('ADMIN', 'SUPERADMIN'), notesController.adminApproveNote);
router.post('/admin/:id/reject', authenticate, authorize('ADMIN', 'SUPERADMIN'), notesController.adminRejectNote);

module.exports = router;
