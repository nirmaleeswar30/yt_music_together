import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import YouTube from 'react-youtube';
import RoomCodeDisplay from './RoomCodeDisplay';

function Room({ user }) {
  const [queue, setQueue] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const { roomId } = useParams();
  const playerRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', roomId);

    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoomDetails(response.data.room);
        setRoomUsers(response.data.users);
        setQueue(response.data.queue);
        if (response.data.queue.length > 0) {
          setCurrentSong(response.data.queue[0]);
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
        setError('Failed to fetch room details. Please try again.');
      }
    };

    fetchRoomDetails();

    newSocket.on('queueUpdated', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    newSocket.on('playbackUpdated', ({ isPlaying, currentTime, currentSongId }) => {
      setIsPlaying(isPlaying);
      if (playerRef.current) {
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
        playerRef.current.seekTo(currentTime);
      }
      if (currentSongId !== currentSong?.id) {
        const newCurrentSong = queue.find(song => song.id === currentSongId);
        setCurrentSong(newCurrentSong);
      }
    });

    newSocket.on('userJoined', (newUser) => {
      setRoomUsers(prevUsers => [...prevUsers, newUser]);
    });

    newSocket.on('userLeft', (userId) => {
      setRoomUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    });

    return () => {
      newSocket.emit('leaveRoom', roomId);
      newSocket.disconnect();
    };
  }, [roomId]);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/songs/${roomId}/queue`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueue(response.data);
      if (response.data.length > 0 && !currentSong) {
        setCurrentSong(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
      setError('Failed to fetch queue. Please try again.');
    }
  };


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
      fetchQueue();
    } catch (error) {
      console.error('Error adding song to queue:', error);
      setError('Failed to add song to queue. Please try again.');
    }
  };

  const removeSong = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/songs/${roomId}/queue/${songId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError(null);
      fetchQueue();
    } catch (error) {
      console.error('Error removing song from queue:', error);
      setError('Failed to remove song from queue. Please try again.');
    }
  };

  const updatePlaybackStatus = async (isPlaying, currentTime) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/rooms/${roomId}/playback`,
        { isPlaying, currentTime, currentSongId: currentSong?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating playback status:', error);
      setError('Failed to update playback status. Please try again.');
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
      updatePlaybackStatus(!isPlaying, playerRef.current.getCurrentTime());
    }
  };

  const handleSkip = () => {
    if (queue.length > 1) {
      const nextSong = queue[1];
      setCurrentSong(nextSong);
      setQueue(prevQueue => prevQueue.slice(1));
      if (playerRef.current) {
        playerRef.current.loadVideoById(nextSong.youtube_id);
        playerRef.current.playVideo();
        setIsPlaying(true);
        updatePlaybackStatus(true, 0);
      }
    } else {
      // If it's the last song, clear the current song and stop playback
      setCurrentSong(null);
      setQueue([]);
      if (playerRef.current) {
        playerRef.current.stopVideo();
      }
      setIsPlaying(false);
      updatePlaybackStatus(false, 0);
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    if (currentSong) {
      playerRef.current.loadVideoById(currentSong.youtube_id);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  };

  const onStateChange = (event) => {
    if (event.data === YouTube.PlayerState.ENDED) {
      handleSkip();
    }
  };

  const leaveRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/rooms/leave/${roomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Redirect to the rooms list after leaving
      window.location.href = '/rooms';
    } catch (error) {
      console.error('Error leaving room:', error);
      setError('Failed to leave the room. Please try again.');
    }
  };
  
  return (
    <div>
      <h2>Room: {roomDetails?.name}</h2>
      {roomDetails && <RoomCodeDisplay roomCode={roomDetails.room_code} />}
      <button onClick={leaveRoom}>Leave Room</button>
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
        {queue.length > 0 ? (
          <div>
            <YouTube
              videoId={currentSong?.youtube_id}
              opts={{ height: '390', width: '640', playerVars: { autoplay: 1 } }}
              onReady={onReady}
              onStateChange={onStateChange}
            />
            <h4>{currentSong?.title}</h4>
            <button onClick={handlePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handleSkip}>Skip</button>
          </div>
        ) : (
          <div className="bg-gray-200 h-96 flex items-center justify-center">
            <p className="text-gray-500">Queue is empty. Add some songs!</p>
          </div>
        )}
      </div>
      <div>
        <h3>Users in Room</h3>
        <ul>
          {roomUsers.map(roomUser => (
            <li key={roomUser.id}>{roomUser.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Room;