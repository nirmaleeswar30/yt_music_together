const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const songRoutes = require('./routes/songs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/songs', songRoutes);

app.get('/', (req, res) => {
  res.send('YouTube Song App API');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});