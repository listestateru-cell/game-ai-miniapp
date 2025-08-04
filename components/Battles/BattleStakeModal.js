import { useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BattleStakeModal({ open, onSelect, onClose, user, battleType }) {
  if (!open) return null;
  if (!user || typeof battleType !== "string") {
    setTimeout(() => {
      if (typeof onClose === 'function') onClose();
    }, 0);
    return null;
  }

  const [loading, setLoading] = useState(false);
  const API_URL = Platform.OS === "web"
    ? "http://localhost:4000"
    : "http://192.168.0.10:4000";
  const stakes = [100, 500, 1000];

  async function handleStakeSelect(stake) {
    setLoading(true);
    try {
      const bodyData = {
        user: { id: user.id, name: user.name, avatar: user.avatar },
        type: battleType,
        stake,
      };
      const res = await fetch(`${API_URL}/battles/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error("Ошибка создания комнаты");
      const room = await res.json();
      setLoading(false);
      setTimeout(() => {
        if (typeof onSelect === "function") onSelect(room);
        if (typeof onClose === "function") onClose();
      }, 0);
    } catch (e) {
      setLoading(false);
      Alert.alert("Ошибка", e.message || "Не удалось создать комнату");
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Ставка</Text>
        {stakes.map(s => (
          <TouchableOpacity key={s} onPress={() => handleStakeSelect(s)} style={styles.stakeButton}>
            <Text style={styles.stakeButtonText}>{s} 🧠</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator color="#4685ff" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (оставь стили как раньше)
});