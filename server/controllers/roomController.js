const Room = require('../models/room');
const Song = require('../models/song');

const roomController = {
  async create(req, res) {
    try {
      const { name, type } = req.body;
      const creatorId = req.user.userId;
  
      // Check if user already has a room
      const existingRoom = await Room.findByCreatorId(creatorId);
      if (existingRoom) {
        return res.status(400).json({ error: 'You can only create one room at a time' });
      }
  
      const room = await Room.create(name, creatorId, type);
      await Room.addUserToRoom(room.id, creatorId);
      res.status(201).json(room);
    } catch (error) {
      console.error('Room creation error:', error);
      res.status(500).json({ error: 'Error creating room', details: error.message });
    }
  },

  async join(req, res) {
    try {
      const { roomCode } = req.params;
      const userId = req.user.userId;
      const room = await Room.findByRoomCode(roomCode);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      await Room.addUserToRoom(room.id, userId);
      const users = await Room.getUsersInRoom(room.id);
      res.json({ room, users });
    } catch (error) {
      res.status(500).json({ error: 'Error joining room' });
    }
  },
  
  async leave(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;
  
      // Remove the user from the room
      await Room.removeUserFromRoom(roomId, userId);
      
      // Check if there are any users left in the room
      const usersInRoom = await Room.getUsersInRoom(roomId);
      if (usersInRoom.length === 0) {
        // Optionally, you could delete the room if it's empty.
        await Room.deleteRoom(roomId);
      }
  
      res.status(200).json({ message: 'Successfully left the room.' });
    } catch (error) {
      console.error('Error leaving room:', error);
      res.status(500).json({ error: 'Error leaving room' });
    }
  },

  async getAllRooms(req, res) {
    try {
      const rooms = await Room.findAll();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching rooms' });
    }
  },

  async getRoom(req, res) {
    try {
      const { roomId } = req.params;
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      const users = await Room.getUsersInRoom(roomId);
      const queue = await Song.getQueue(roomId);
      res.json({ room, users, queue });
    } catch (error) {
      res.status(500).json({ error: 'Error getting room details' });
    }
  },

  async updatePlaybackStatus(req, res) {
    try {
      const { roomId } = req.params;
      const { isPlaying, currentTime, currentSongId } = req.body;
      const updatedRoom = await Room.updatePlaybackStatus(roomId, isPlaying, currentTime, currentSongId);
      req.io.to(roomId).emit('playbackUpdated', { isPlaying, currentTime, currentSongId });
      res.json(updatedRoom);
    } catch (error) {
      res.status(500).json({ error: 'Error updating playback status' });
    }
  }
};

module.exports = roomController;