import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BattleMenu from "./BattleMenu";

export default function BattleLobby({ user, onJoinedRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stopped = false;
    async function load() {
      try {
        const res = await fetch(
          Platform.OS === "web"
            ? "http://localhost:4000/battles"
            : "http://192.168.0.10:4000/battles"
        );
        const data = await res.json();
        if (!stopped) setRooms(data);
      } catch {
        if (!stopped) setRooms([]);
      }
      if (!stopped) setLoading(false);
    }
    load();
    const interval = setInterval(load, 2000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  async function handleJoinRoom(roomId) {
    try {
      const res = await fetch(
        (Platform.OS === "web"
          ? "http://localhost:4000"
          : "http://192.168.0.10:4000") + "/battles/join",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, user }),
        }
      );
      const room = await res.json();
      onJoinedRoom(room);
    } catch (e) {
      alert("Ошибка присоединения: " + e.message);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#ffe066" />
      </View>
    );
  }

  return (
    <BattleMenu
      onSelectType={() => {}}
      rooms={rooms}
      onJoinRoom={handleJoinRoom}
    />
  );
}