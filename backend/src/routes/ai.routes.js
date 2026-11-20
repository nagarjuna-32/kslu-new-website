const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');

router.post('/ask', optionalAuthenticate, aiController.askTutor);
router.post('/explain', optionalAuthenticate, aiController.explain);
router.post('/practice-questions', optionalAuthenticate, aiController.practiceQuestions);
router.post('/summarize', optionalAuthenticate, aiController.summarize);

module.exports = router;
