const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const authMiddleware = require('../middleware/auth');

router.post('/:roomId/queue', authMiddleware, songController.addToQueue);
router.get('/:roomId/queue', authMiddleware, songController.getQueue);
router.delete('/:roomId/queue/:songId', authMiddleware, songController.removeSong);
router.put('/:roomId/queue/:songId/position', authMiddleware, songController.updatePosition);

// New routes
router.get('/search', authMiddleware, songController.searchYouTube);
router.get('/video/:videoId', authMiddleware, songController.getVideoDetails);

module.exports = router;