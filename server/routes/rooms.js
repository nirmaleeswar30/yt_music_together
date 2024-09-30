const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, roomController.getAllRooms);
router.post('/', authMiddleware, roomController.create);
router.post('/join/:roomCode', authMiddleware, roomController.join);
router.get('/:roomId', authMiddleware, roomController.getRoom);
router.post('/leave/:roomId', authMiddleware, roomController.leave);
router.put('/:roomId/playback', authMiddleware, roomController.updatePlaybackStatus);

module.exports = router;