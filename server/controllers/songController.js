const Song = require('../models/song');
const Room = require('../models/room');

const songController = {
  async addToQueue(req, res) {
    try {
      const { roomId } = req.params;
      const { youtubeId, title } = req.body;
      const userId = req.user.userId;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const song = await Song.addToQueue(roomId, userId, youtubeId, title);
      res.status(201).json(song);
    } catch (error) {
      res.status(500).json({ error: 'Error adding song to queue' });
    }
  },

  async getQueue(req, res) {
    try {
      const { roomId } = req.params;
      const queue = await Song.getQueue(roomId);
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: 'Error getting song queue' });
    }
  },

  async removeSong(req, res) {
    try {
      const { roomId, songId } = req.params;
      const removedSong = await Song.removeSong(songId, roomId);
      if (!removedSong) {
        return res.status(404).json({ error: 'Song not found in queue' });
      }
      res.json(removedSong);
    } catch (error) {
      res.status(500).json({ error: 'Error removing song from queue' });
    }
  },

  async updatePosition(req, res) {
    try {
      const { roomId, songId } = req.params;
      const { newPosition } = req.body;
      await Song.updatePosition(songId, newPosition, roomId);
      const updatedQueue = await Song.getQueue(roomId);
      res.json(updatedQueue);
    } catch (error) {
      res.status(500).json({ error: 'Error updating song position' });
    }
  }
};

module.exports = songController;