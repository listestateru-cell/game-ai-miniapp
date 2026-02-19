// Если при запуске ошибка "Unable to resolve module", попробуйте удалить node_modules и очистить кэш Metro:
// rm -rf node_modules && npm install
// npx expo start -c

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { register } from "../../src/apiClient";

export default function Registration({ onRegister, onGoToLogin }) {
  const avatarImages = [
    require("../../assets/images/fox.png"),
    require("../../assets/images/hedgehog.png"),
    require("../../assets/images/hare.png"),
    require("../../assets/images/bear.png"),
    require("../../assets/images/owl.png"),
    require("../../assets/images/wolf.png"),
  ];
  const avatarNames = ["лиса", "ёж", "заяц", "медведь", "сова", "волк"];

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePrevAvatar = () => setAvatar((prev) => (prev === 0 ? avatarImages.length - 1 : prev - 1));
  const handleNextAvatar = () => setAvatar((prev) => (prev === avatarImages.length - 1 ? 0 : prev + 1));

  const handleSubmit = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Заполните все поля.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password: password.trim(),
        avatar: avatar,
      });
      setLoading(false);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      if (typeof onRegister === "function") onRegister(user);
      Alert.alert("Успех", "Регистрация прошла успешно!");
    } catch (error) {
      setLoading(false);
      Alert.alert("Ошибка регистрации", error.message || "Попробуйте ещё раз.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#fff"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Никнейм"
        placeholderTextColor="#fff"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Выберите аватар:</Text>
      <View style={styles.avatarSelector}>
        <TouchableOpacity onPress={handlePrevAvatar} style={styles.arrowButton} activeOpacity={0.7}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>
        <View style={styles.avatarWrapper}>
          <Image source={avatarImages[avatar]} style={styles.avatar} />
          <Text style={styles.avatarName}>{avatarNames[avatar]}</Text>
        </View>
        <TouchableOpacity onPress={handleNextAvatar} style={styles.arrowButton} activeOpacity={0.7}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.customButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={loading}
      >
        <Text style={styles.customButtonText}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onGoToLogin}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryButtonText}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    height: 48,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  avatarSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  arrowButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  arrowText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  avatarWrapper: {
    alignItems: "center",
    marginHorizontal: 10,
    minWidth: 140,
    minHeight: 180,
    justifyContent: "center",
  },
  avatar: {
    width: 140,
    height: 180,
    resizeMode: "contain",
  },
  avatarName: {
    marginTop: 10,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  customButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  customButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});