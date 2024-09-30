const db = require('../config/db');
const crypto = require('crypto');

const Room = {
  async create(name, creatorId, type) {
    try {
      const roomCode = await this.generateUniqueRoomCode();
      const query = 'INSERT INTO rooms (name, creator_id, type, room_code) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [name, creatorId, type, roomCode];
      console.log('Executing room creation query:', query);
      console.log('Query values:', values);
      const result = await db.query(query, values);
      console.log('Room creation result:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Room.create:', error);
      throw error;
    }
  },

  async findByCreatorId(creatorId) {
    const query = 'SELECT * FROM rooms WHERE creator_id = $1';
    const result = await db.query(query, [creatorId]);
    return result.rows[0]; // Return the first room if found, or undefined if no room exists
  },

  async findById(id) {
    const query = 'SELECT * FROM rooms WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async findByRoomCode(roomCode) {
    const query = 'SELECT * FROM rooms WHERE room_code = $1';
    const result = await db.query(query, [roomCode]);
    return result.rows[0];
  },

  async removeUserFromRoom(roomId, userId) {
    const query = 'DELETE FROM room_users WHERE room_id = $1 AND user_id = $2';
    await db.query(query, [roomId, userId]);
  },

  async deleteRoom(roomId) {
    const query = 'DELETE FROM rooms WHERE id = $1';
    await db.query(query, [roomId]);
  },

  async findAll(includePrivate = false) {
    const query = includePrivate ? 'SELECT * FROM rooms' : 'SELECT * FROM rooms WHERE type = \'public\'';
    const result = await db.query(query);
    return result.rows;
  },

  async generateUniqueRoomCode() {
    while (true) {
      const roomCode = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
      const existingRoom = await this.findByRoomCode(roomCode);
      if (!existingRoom) {
        return roomCode;
      }
    }
  },

  async updatePlaybackStatus(roomId, isPlaying, currentTime, currentSongId) {
    const query = 'UPDATE rooms SET is_playing = $1, current_time = $2, current_song_id = $3 WHERE id = $4 RETURNING *';
    const values = [isPlaying, currentTime, currentSongId, roomId];
    const result = await db.query(query, values);
    return result.rows[0];
  },
  
  async addUserToRoom(roomId, userId) {
    const query = 'INSERT INTO room_users (room_id, user_id) VALUES ($1, $2) RETURNING *';
    const values = [roomId, userId];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUsersInRoom(roomId) {
    const query = 'SELECT users.id, users.username FROM users INNER JOIN room_users ON users.id = room_users.user_id WHERE room_users.room_id = $1';
    const result = await db.query(query, [roomId]);
    return result.rows;
  }
};

module.exports = Room;