import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';

function RoomList({ user }) {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const API_BASE_URL = 'http://localhost:5000/api';
    const [error, setError] = useState(null);
  
    useEffect(() => {
      fetchRooms();
    }, []);
  
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Error fetching rooms. Please try again later.');
      }
    };
  
    const createRoom = async (e) => {
      e.preventDefault();
      if (!newRoomName.trim()) {
        setError('Please enter a room name.');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/rooms`, { name: newRoomName }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNewRoomName('');
        fetchRooms();
      } catch (error) {
        console.error('Error creating room:', error);
        setError('Failed to create room. Please try again later.');
      }
    };
  
    return (
      <div>
        <h2>Rooms</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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

export default RoomList;