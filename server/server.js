const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const songRoutes = require('./routes/songs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/songs', songRoutes);

app.get('/', (req, res) => {
  res.send('YouTube Song App API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});