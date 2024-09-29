import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function Room({ user }) {
  const [queue, setQueue] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState(null);
  const { roomId } = useParams();
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';
  
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', roomId);

    newSocket.on('queueUpdated', (updatedQueue) => {
        setQueue(updatedQueue);
    });

    return () => {
        newSocket.emit('leaveRoom', roomId);
        newSocket.disconnect();
    };
  }, [roomId]);;

    useEffect(() => {
      if (roomId) {
          fetchQueue();
        }
      }, [roomId]);
  
    const searchSongs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/songs/search`, { params: { query: searchQuery } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching songs:', error);
        setError('Failed to search songs. Please try again.');
      }
    };
  
    const addToQueue = async (videoId, title) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/songs/${roomId}/queue`, 
          { youtubeId: videoId, title },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Song added successfully:', response.data);
        setError(null);
        fetchQueue(); // Fetch the updated queue immediately
      } catch (error) {
        console.error('Error adding song to queue:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          setError(`Failed to add song to queue: ${error.response.data.error || 'Unknown error'}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          setError('Failed to add song to queue: No response from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          setError(`Failed to add song to queue: ${error.message}`);
        }
      }
    };
  
    const removeSong = async (songId) => {
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`${API_BASE_URL}/songs/${roomId}/queue/${songId}`, 
              { headers: { Authorization: `Bearer ${token}` } }
          );
          setError(null);
          fetchQueue(); // Fetch the updated queue immediately
      } catch (error) {
        console.error('Error removing song from queue:', error);
        setError('Failed to remove song from queue. Please try again.');
      }
    };

  
    const updatePlayback = async (currentTime, isPlaying) => {
      try {
        await axios.post(`${API_BASE_URL}/songs/${Room.id}/playback`, { currentTime, isPlaying });
      } catch (error) {
        console.error('Error updating playback:', error);
      }
    };

    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/songs/${roomId}/queue`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQueue(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching queue:', error);
      setError('Failed to fetch queue. Please try again.');
    }
  };

    
  
  return (
    <div>
      <h2>Room: {roomId}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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