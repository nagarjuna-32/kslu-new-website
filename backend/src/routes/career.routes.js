const express = require('express');
const router = express.Router();
const careerController = require('../controllers/career.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', careerController.listOpportunities);
router.get('/:id', careerController.getOpportunityById);

// Admin routes
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), careerController.adminCreateOpportunity);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), careerController.adminUpdateOpportunity);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), careerController.adminDeleteOpportunity);

module.exports = router;
