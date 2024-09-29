const Song = require('../models/song');
const Room = require('../models/room');
const youtube = require('../services/youtube');

const songController = {
  async addToQueue(req, res) {
    try {
      const { roomId } = req.params;
      const { youtubeId } = req.body;
      const userId = req.user.userId;

      console.log(`Adding song to queue. RoomId: ${roomId}, YoutubeId: ${youtubeId}, UserId: ${userId}`);

      const room = await Room.findById(roomId);
      if (!room) {
        console.log(`Room not found: ${roomId}`);
        return res.status(404).json({ error: 'Room not found' });
      }

      // Fetch video details from YouTube API
    const response = await youtube.videos.list({
        part: 'snippet',
        id: youtubeId
      });
  
      if (response.data.items.length === 0) {
        console.log(`YouTube video not found: ${youtubeId}`);
        return res.status(404).json({ error: 'Video not found' });
      }
  
      const video = response.data.items[0];
      const title = video.snippet.title;
      
      console.log(`Adding song to queue: ${title}`);
      const song = await Song.addToQueue(roomId, userId, youtubeId, title);
      console.log(`Song added to queue: ${JSON.stringify(song)}`);

      console.log(`Fetching updated queue for room: ${roomId}`);
      const updatedQueue = await Song.getQueue(roomId);
      console.log(`Updated queue: ${JSON.stringify(updatedQueue)}`);

      console.log(`Emitting queueUpdated event to room: ${roomId}`);
      // Check if io is available
      if (req.app.get('io')) {
        req.app.get('io').to(roomId).emit('queueUpdated', updatedQueue);
      } else {
        console.warn('Socket.IO instance not available');
      }
      
      res.status(201).json(song);
    } catch (error) {
      console.error('Error in addToQueue:', error);
      res.status(500).json({ error: 'Error adding song to queue', details: error.message });
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
        
        // Check if the room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Remove the song
        const removedSong = await Song.removeSong(songId, roomId);
        if (!removedSong) {
            return res.status(404).json({ error: 'Song not found in queue' });
        }
        
        const updatedQueue = await Song.getQueue(roomId);
       // Check if io is available
       if (req.app.get('io')) {
        req.app.get('io').to(roomId).emit('queueUpdated', updatedQueue);
      } else {
        console.warn('Socket.IO instance not available');
      }

        res.json(removedSong);
      } catch (error) {
        console.error('Error removing song from queue:', error);
        res.status(500).json({ error: 'Error removing song from queue' });
      }
    },

  async updatePosition(req, res) {
    try {
      const { roomId, songId } = req.params;
      const { newPosition } = req.body;
      await Song.updatePosition(songId, newPosition, roomId);
      const updatedQueue = await Song.getQueue(roomId);
      
      req.io.to(roomId).emit('queueUpdated', updatedQueue);

      res.json(updatedQueue);
    } catch (error) {
      res.status(500).json({ error: 'Error updating song position' });
    }
  },
  
  async searchYouTube(req, res) {
    try {
      const { query } = req.query;
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 10
      });

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url
      }));

      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Error searching YouTube' });
    }
  },

  async updatePlayback(req, res) {
    try {
      const { roomId } = req.params;
      const { currentTime, isPlaying } = req.body;
      
      // Emit playback update to all clients in the room except sender
      req.io.to(roomId).emit('playbackUpdated', { currentTime, isPlaying });
      
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: 'Error updating playback' });
    }
  },

  async getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;
      const response = await youtube.videos.list({
        part: 'snippet,contentDetails',
        id: videoId
      });

      if (response.data.items.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const video = response.data.items[0];
      const details = {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.standard.url,
        duration: video.contentDetails.duration
      };

      res.json(details);
    } catch (error) {
      res.status(500).json({ error: 'Error getting video details' });
    }
  }
};

module.exports = songController;