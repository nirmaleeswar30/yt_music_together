const db = require('../db');

const Song = {
  async addToQueue(roomId, userId, youtubeId, title) {
    const query = `
      INSERT INTO song_queue (room_id, user_id, youtube_id, title, position)
      SELECT $1, $2, $3, $4, COALESCE(MAX(position), 0) + 1
      FROM song_queue
      WHERE room_id = $1
      RETURNING *
    `;
    const values = [roomId, userId, youtubeId, title];
    try {
    console.log('Executing query:', query);
    console.log('Query values:', values);
    const result = await db.query(query, values);
    console.log('Query result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Database error when adding song to queue:', error);
      throw error;
    }
  },

  async getQueue(roomId) {
    const query = `
      SELECT sq.*, u.username
      FROM song_queue sq
      JOIN users u ON sq.user_id = u.id
      WHERE sq.room_id = $1
      ORDER BY sq.position
    `;
    const result = await db.query(query, [roomId]);
    return result.rows;
  },

  async removeSong(songId, roomId) {
    const query = 'DELETE FROM song_queue WHERE id = $1 AND room_id = $2 RETURNING *';
    try {
        const result = await db.query(query, [songId, roomId]);
        return result.rows[0];
    } catch (error) {
        console.error('Database error when removing song from queue:', error);
        throw error;
    }
  },


  async updatePosition(id, newPosition, roomId) {
    const query = `
      UPDATE song_queue
      SET position = 
        CASE 
          WHEN position < $2 THEN position - 1
          WHEN position > $2 THEN position + 1
          ELSE $2
        END
      WHERE room_id = $3 AND (
        (position BETWEEN $2 AND (SELECT position FROM song_queue WHERE id = $1))
        OR
        (position BETWEEN (SELECT position FROM song_queue WHERE id = $1) AND $2)
      );
      UPDATE song_queue SET position = $2 WHERE id = $1 AND room_id = $3;
    `;
    await db.query(query, [id, newPosition, roomId]);
  }
};

module.exports = Song;