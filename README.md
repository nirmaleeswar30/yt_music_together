# yt_music_together

## Technology Stack

* Frontend: React
* Backend: Node.js with Express
* Database: PostgreSQL
* Real-time communication: Socket.io
* Authentication: JWT (JSON Web Tokens)
* API: YouTube Data API v3

## File Structure

```
yt_music_together/
├── client
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   └── src
│       ├── App.css
│       ├── App.js
│       ├── App.test.js
│       ├── components
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Room.js
│       │   └── RoomList.js
│       ├── index.css
│       ├── index.js
│       ├── logo.svg
│       ├── reportWebVitals.js
│       └── setupTests.js
├── server
│   ├── controllers
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   └── songController.js
│   ├── db.js
│   ├── middleware
│   │   └── auth.js
│   ├── models
│   │   ├── room.js
│   │   ├── song.js
│   │   └── user.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   └── songs.js
│   ├── server.js
│   └── services
│       └── youtube.js
├── README.md
├── package-lock.json
└── package.json
```

# Tasks Breakdown

1. Project Setup
   * Initialize project with Node.js
   * Set up Express backend
   * Configure PostgreSQL database
2. Backend Development
   * Implement user authentication (signup, login, logout)
   * Create API routes for rooms and songs
   * Integrate YouTube Data API v3
   * Implement Socket.io for real-time updates
3. Database Design
    * Design schema for users, rooms, and songs
    * Set up PostgreSQL tables
    * Implement database queries and operations
4. Frontend Development
   * Create main application layout
   * Implement user authentication UI
   * Develop room creation and joining functionality
   * Create song search and queue management components
   * Implement real-time updates with Socket.io client
5. YouTube Integration
   * Implement YouTube search functionality
   * Create YouTube player component
   * Synchronize playback across users in a room
