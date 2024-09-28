const Room = require('../models/room');

const roomController = {
  async create(req, res) {
    try {
      const { name } = req.body;
      const creatorId = req.user.userId;
      const room = await Room.create(name, creatorId);
      await Room.addUserToRoom(room.id, creatorId);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: 'Error creating room' });
    }
  },

  async join(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.userId;
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      await Room.addUserToRoom(roomId, userId);
      const users = await Room.getUsersInRoom(roomId);
      res.json({ room, users });
    } catch (error) {
      res.status(500).json({ error: 'Error joining room' });
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
      res.json({ room, users });
    } catch (error) {
      res.status(500).json({ error: 'Error getting room details' });
    }
  }
};

module.exports = roomController;