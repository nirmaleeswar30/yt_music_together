import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/rooms" element={<RoomList user={user} />} />
          <Route path="/room/:roomId" element={<Room user={user} socket={socket} />} />
          <Route path="/" element={<h1>Welcome to YouTube Song Sharing App</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;