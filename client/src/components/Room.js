import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function Room({ user, socket }) {
    const [queue, setQueue] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';
  
    useEffect(() => {
      if (socket) {
        socket.on('queueUpdated', (updatedQueue) => {
          setQueue(updatedQueue);
        });
  
        socket.on('playbackUpdated', ({ currentTime, isPlaying }) => {
          // Update video player with new time and play state
        });
  
        return () => {
          socket.off('queueUpdated');
          socket.off('playbackUpdated');
        };
      }
    }, [socket]);
  
    const searchSongs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/songs/search`, { params: { query: searchQuery } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    };
  
    const addToQueue = async (videoId, title) => {
      try {
        await axios.post(`${API_BASE_URL}/songs/${Room.id}/queue`, { youtubeId: videoId, title });
      } catch (error) {
        console.error('Error adding song to queue:', error);
      }
    };
  
    const removeSong = async (songId) => {
      try {
        await axios.delete(`${API_BASE_URL}/songs/${Room.id}/queue/${songId}`);
      } catch (error) {
        console.error('Error removing song from queue:', error);
      }
    };
  
    const updatePlayback = async (currentTime, isPlaying) => {
      try {
        await axios.post(`${API_BASE_URL}/songs/${Room.id}/playback`, { currentTime, isPlaying });
      } catch (error) {
        console.error('Error updating playback:', error);
      }
    };
  
    return (
      <div>
        <h2>Room: {Room.name}</h2>
        <div>
          <h3>Search Songs</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs"
          />
          <button onClick={searchSongs}>Search</button>
          <ul>
            {searchResults.map(video => (
              <li key={video.id}>
                {video.title}
                <button onClick={() => addToQueue(video.id, video.title)}>Add to Queue</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Queue</h3>
          <ul>
            {queue.map(song => (
              <li key={song.id}>
                {song.title}
                <button onClick={() => removeSong(song.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Now Playing</h3>
          {/* Implement YouTube player here */}
          {currentSong && (
            <div>
              <h4>{currentSong.title}</h4>
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
}

export default Room;