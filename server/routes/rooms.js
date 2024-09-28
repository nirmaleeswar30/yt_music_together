const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, roomController.getAllRooms); // New route
router.post('/', authMiddleware, roomController.create);
router.post('/:roomId/join', authMiddleware, roomController.join);
router.get('/:roomId', authMiddleware, roomController.getRoom);

module.exports = router;