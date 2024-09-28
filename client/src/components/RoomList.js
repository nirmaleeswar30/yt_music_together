import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { BrowserRouter as Link } from 'react-router-dom';

function RoomList({ user }) {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const API_BASE_URL = 'http://localhost:5000/api';
  
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

export default RoomList;