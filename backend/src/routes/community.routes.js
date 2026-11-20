const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

router.get('/discussions', optionalAuthenticate, communityController.listDiscussions);
router.get('/discussions/:id', optionalAuthenticate, communityController.getDiscussionById);
router.post('/discussions', authenticate, communityController.createDiscussion);
router.post('/discussions/:id/vote', authenticate, communityController.voteDiscussion);
router.post('/discussions/:id/comments', authenticate, communityController.addComment);
router.post('/discussions/:discussionId/comments/:commentId/accept', authenticate, communityController.markAcceptedAnswer);

module.exports = router;
