const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/courses', academicController.getCourses);
router.get('/courses/:id', academicController.getCourseById);
router.get('/courses/:courseId/semesters', academicController.getSemestersByCourse);
router.get('/subjects', academicController.getSubjects);
router.get('/subjects/:id', academicController.getSubjectById);
router.get('/schemes', academicController.getSchemes);

// Admin routes
router.post('/courses', authenticate, authorize('ADMIN', 'SUPERADMIN'), academicController.adminCreateCourse);
router.post('/subjects', authenticate, authorize('ADMIN', 'SUPERADMIN'), academicController.adminCreateSubject);
router.put('/subjects/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), academicController.adminUpdateSubject);
router.delete('/subjects/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), academicController.adminDeleteSubject);

module.exports = router;
