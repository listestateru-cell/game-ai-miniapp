const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3030;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = path.join(__dirname, "users.json");
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf-8");
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// Регистрация
app.post("/register", (req, res) => {
  const { email, password, username, avatar } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Все поля обязательны" });
  }
  let users = readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "Пользователь с таким email уже существует" });
  }
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    email,
    password,
    username,
    avatar,
    coins: 0
  };
  users.push(user);
  writeUsers(users);
  res.json(user);
});

// Логин
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Неверный email или пароль" });
  res.json(user);
});

// Получить пользователя по id
app.get("/users/:id", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });
  res.json(user);
});

// Обновить монеты пользователя
app.post("/users/:id/coins", (req, res) => {
  const { coins, email, username } = req.body;
  let users = readUsers();

  let user = users.find(u => u.id === req.params.id);
  if (!user) {
    if (email) {
      user = users.find(u => u.email === email);
    }
    if (!user && username) {
      user = users.find(u => u.username === username);
    }
  }

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  if (typeof coins !== "number") {
    return res.status(400).json({ message: "coins должен быть числом" });
  }

  const oldCoins = user.coins;
  user.coins = coins;
  writeUsers(users);

  console.log(`[SAVE COINS] Запрос от email ${user.email || "unknown"}: ${oldCoins} -> ${user.coins}`);
  console.log(`[SAVE COINS] Успешно: ID = ${user.id}, email = ${user.email}, coins = ${user.coins}`);

  res.json({ success: true, coins: user.coins });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));