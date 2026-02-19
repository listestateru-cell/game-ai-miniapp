// Battle server — unified for Web + iOS (dev)
// Listens on 0.0.0.0:3030, exposes REST for rooms and Socket.IO for realtime

const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3030;

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:19006',
      'http://127.0.0.1:19006',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      '*',
    ],
    credentials: false,
  })
);
app.use(express.json());

const USERS_PATH = path.join(__dirname, '..', 'users.json');

// --- Хранилище комнат ---
let battleRooms = [];

// Надёжная загрузка users.json
function loadUsers() {
  try {
    const raw = fs.readFileSync(USERS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[users] load error:', err.message);
    return [];
  }
}

// Health-checks
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/ping', (_req, res) => res.json({ ok: true }));

// Debug endpoints
app.get('/users', (_req, res) => res.json(loadUsers()));
app.get('/battles', (_req, res) => res.json(battleRooms));

// Create battle room
app.post('/battles/create', (req, res) => {
  const { user, type, stake } = req.body || {};
  if (!user || !user.id) return res.status(400).json({ error: 'no_user' });

  const roomId = Math.random().toString(36).slice(2);
  const room = {
    id: roomId,
    type: type || 'classic',
    stake: Number.isFinite(stake) ? stake : 0,
    players: [user],
    createdAt: Date.now(),
    started: false,
  };
  battleRooms.push(room);

  if (io) io.emit('battles:update', battleRooms);
  return res.json(room);
});

// Join battle room
app.post('/battles/join', (req, res) => {
  const { roomId, user } = req.body || {};
  const room = battleRooms.find((r) => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });
  if (!user || !user.id) return res.status(400).json({ error: 'no_user' });
  if (room.players.some((p) => p.id === user.id)) return res.json(room);
  if (room.players.length >= 2) return res.status(403).json({ error: 'full' });

  room.players.push(user);
  room.started = room.players.length === 2;

  if (io) {
    io.to(roomId).emit('roomEvent', { type: 'joined', room });
    io.emit('battles:update', battleRooms);
  }
  return res.json(room);
});

// Leave battle room (optional)
app.post('/battles/leave', (req, res) => {
  const { roomId, userId } = req.body || {};
  const room = battleRooms.find((r) => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'not_found' });

  room.players = room.players.filter((p) => p.id !== userId);
  room.started = room.players.length === 2;

  if (room.players.length === 0) {
    battleRooms = battleRooms.filter((r) => r.id !== roomId);
  }

  if (io) {
    io.to(roomId).emit('roomEvent', { type: 'left', userId });
    io.emit('battles:update', battleRooms);
  }
  return res.json({ ok: true });
});

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:19006',
      'http://127.0.0.1:19006',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      '*',
    ],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id);

  socket.on('joinRoom', ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    io.to(roomId).emit('roomEvent', { type: 'joined', userId: userId || socket.id });
  });

  socket.on('leaveRoom', ({ roomId, userId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    io.to(roomId).emit('roomEvent', { type: 'left', userId: userId || socket.id });
  });

  socket.on('message', ({ roomId, data } = {}) => {
    if (roomId) io.to(roomId).emit('message', { from: socket.id, data });
  });

  socket.on('battle:action', ({ roomId, payload } = {}) => {
    if (roomId) io.to(roomId).emit('battle:action', { from: socket.id, payload });
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected', socket.id, reason);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Battle server listening on http://${HOST}:${PORT}`);
});