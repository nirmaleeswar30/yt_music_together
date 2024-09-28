const db = require('../db');

const Room = {
  async create(name, creatorId) {
    const query = 'INSERT INTO rooms (name, creator_id) VALUES ($1, $2) RETURNING *';
    const values = [name, creatorId];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id) {
    const query = 'SELECT * FROM rooms WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async findAll() {
    const query = 'SELECT * FROM rooms';
    const result = await db.query(query);
    return result.rows;
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