const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

let battleRooms = [];

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

app.get("/battles", (req, res) => {
  res.json(battleRooms);
});

app.post("/battles/create", (req, res) => {
  const { user, type, stake } = req.body;
  if (!user || !user.id) return res.status(400).json({ error: "no user" });

  const room = {
    id: Math.random().toString(36).slice(2),
    type,
    stake,
    players: [user],
    createdAt: Date.now(),
    started: false
  };
  battleRooms.push(room);
  res.json(room);
});

app.post("/battles/join", (req, res) => {
  const { roomId, user } = req.body;
  const room = battleRooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: "not_found" });
  if (room.players.length >= 2) return res.status(403).json({ error: "full" });
  room.players.push(user);
  res.json(room);
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Battle server running on port ${PORT}`);
});