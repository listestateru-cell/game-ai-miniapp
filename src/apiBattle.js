import { Platform } from "react-native";
const LOCAL = "http://localhost:4000";
const LAN = "http://192.168.0.14:4000"; // Укажи здесь свой локальный IP (тот же, что используется на iOS и других устройствах)
const API = Platform.OS === "web" ? LOCAL : LAN;

export async function createBattleRoom(user, type, stake) {
  const res = await fetch(`${API}/battles/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, type, stake })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function joinBattleRoom(roomId, user) {
  const res = await fetch(`${API}/battles/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, user })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchBattles() {
  const res = await fetch(`${API}/battles`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function pingBattleServer() {
  const res = await fetch(`${API}/ping`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}