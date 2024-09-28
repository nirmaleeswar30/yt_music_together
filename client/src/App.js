import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

// Assume we have these components defined
import Login from './components/Login';
import Register from './components/Register';
import RoomList from './components/RoomList';
import Room from './components/Room';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data here
    }

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {user ? (
              <>
                <li><Link to="/rooms">Rooms</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>

        <Switch>
          <Route path="/login">
            <Login setUser={setUser} />
          </Route>
          <Route path="/register">
            <Register setUser={setUser} />
          </Route>
          <Route path="/rooms">
            <RoomList user={user} />
          </Route>
          <Route path="/room/:roomId">
            <Room user={user} socket={socket} />
          </Route>
          <Route path="/">
            <h1>Welcome to YouTube Song Sharing App</h1>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}

function Register({ setUser }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
  );
}

function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/rooms`, { name: newRoomName });
      setNewRoomName('');
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div>
      <h2>Rooms</h2>
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            <Link to={`/room/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
      <form onSubmit={createRoom}>
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New room name"
          required
        />
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
}

function Room({ user, socket }) {
  const [queue, setQueue] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      await axios.post(`${API_BASE_URL}/songs/${room.id}/queue`, { youtubeId: videoId, title });
    } catch (error) {
      console.error('Error adding song to queue:', error);
    }
  };

  const removeSong = async (songId) => {
    try {
      await axios.delete(`${API_BASE_URL}/songs/${room.id}/queue/${songId}`);
    } catch (error) {
      console.error('Error removing song from queue:', error);
    }
  };

  const updatePlayback = async (currentTime, isPlaying) => {
    try {
      await axios.post(`${API_BASE_URL}/songs/${room.id}/playback`, { currentTime, isPlaying });
    } catch (error) {
      console.error('Error updating playback:', error);
    }
  };

  return (
    <div>
      <h2>Room: {room.name}</h2>
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

export default App;