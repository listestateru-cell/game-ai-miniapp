// Battle server endpoints autodetect
const BATTLE_HOST = "http://localhost:4000";
const BATTLE_LAN = "http://192.168.0.14:4000"; // ← твой IP-адрес Mac, поправь если нужен другой
export const BATTLE_API_BASE = Platform.OS === "web" ? BATTLE_HOST : BATTLE_LAN;

export async function pingBattleServer() {
  try {
    const res = await fetch(`${BATTLE_API_BASE}/ping`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchBattleRooms() {
  const res = await fetch(`${BATTLE_API_BASE}/battles`);
  if (!res.ok) throw new Error("Ошибка получения комнат батлов");
  return res.json();
}

export async function createBattleRoom({ user, type, stake }) {
  const res = await fetch(`${BATTLE_API_BASE}/battles/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, type, stake }),
  });
  if (!res.ok) throw new Error("Ошибка создания комнаты батлов");
  return res.json();
}

export async function joinBattleRoom({ roomId, user }) {
  const res = await fetch(`${BATTLE_API_BASE}/battles/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, user }),
  });
  if (!res.ok) throw new Error("Ошибка присоединения к комнате батлов");
  return res.json();
}
import { Platform } from "react-native";

const HOST = "http://localhost:3030";
const LAN = "http://192.168.0.14:3030"; // ← твой IP-адрес Mac

export const API_BASE = Platform.OS === "web" ? HOST : LAN;

export async function register(body) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Ошибка регистрации");
  return res.json();
}

export async function login(body) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Ошибка входа");
  return res.json();
}

export async function getUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error("Не удалось получить юзера");
  return res.json();
}

export async function updateCoins(id, coins) {
  const res = await fetch(`${API_BASE}/users/${id}/coins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coins }),
  });
  if (!res.ok) throw new Error("Не удалось обновить коины");
  return res.json();
}