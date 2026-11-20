const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const academicRoutes = require('./academic.routes');
const pyqRoutes = require('./pyq.routes');
const notesRoutes = require('./notes.routes');
const communityRoutes = require('./community.routes');
const careerRoutes = require('./career.routes');
const announcementsRoutes = require('./announcements.routes');
const notificationsRoutes = require('./notifications.routes');
const aiRoutes = require('./ai.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/academic', academicRoutes);
router.use('/pyqs', pyqRoutes);
router.use('/notes', notesRoutes);
router.use('/community', communityRoutes);
router.use('/career', careerRoutes);
router.use('/announcements', announcementsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'KSLU Circle Academic Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
