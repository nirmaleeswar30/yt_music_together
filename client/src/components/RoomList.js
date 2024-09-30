import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [joinRoomCode, setJoinRoomCode] = useState('');
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
      const response = await axios.post(`${API_BASE_URL}/rooms`, { name: newRoomName, type: roomType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Redirect to the newly created room
      window.location.href = `/room/${response.data.id}`;
    } catch (error) {
      console.error('Error creating room:', error);
      setError(error.response?.data?.error || 'Failed to create room. Please try again later.');
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomCode.trim()) {
      setError('Please enter a room code.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/rooms/join/${joinRoomCode}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Redirect to the joined room
      window.location.href = `/room/${response.data.room.id}`;
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please check the room code and try again.');
    }
  };

  return (
    <div>
      <h2>Rooms</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {rooms.map(room => (
          <li key={room.id}>
            <Link to={`/room/${room.id}`}>{room.name} ({room.type})</Link>
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
        <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button type="submit">Create Room</button>
      </form>
      <form onSubmit={joinRoom}>
        <input
          type="text"
          value={joinRoomCode}
          onChange={(e) => setJoinRoomCode(e.target.value)}
          placeholder="Enter room code"
          required
        />
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
}

export default RoomList;