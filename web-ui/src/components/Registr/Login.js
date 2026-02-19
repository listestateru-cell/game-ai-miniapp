// components/Registr/Login.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { register } from "../../src/apiClient";

export default function Login({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Введите email и пароль.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3030/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        await AsyncStorage.setItem("user", JSON.stringify(data));
        onLogin && onLogin(data);
      } else {
        Alert.alert("Ошибка входа", data.message || "Попробуйте ещё раз.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Ошибка", "Ошибка сети. Попробуйте ещё раз.");
    }
  };

  const onRegister = async (form) => {
    try {
      const user = await register(form);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setCoins(user.coins || 0);
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось зарегистрироваться");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Вход..." : "Войти"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkButton} onPress={onGoToRegister}>
        <Text style={styles.linkButtonText}>Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  input: {
    width: 280,
    backgroundColor: "#18181f",
    color: "#fff",
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    marginBottom: 16,
  },
  button: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 18 },
  linkButton: { marginTop: 6 },
  linkButtonText: { color: "#fff", fontSize: 16, textDecorationLine: "underline" },
});