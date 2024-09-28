import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const API_BASE_URL = 'http://localhost:5000/api';
  
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

  export default Login;