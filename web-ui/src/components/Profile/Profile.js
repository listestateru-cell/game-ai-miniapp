import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Компонент профиля пользователя.
// Показывает данные профиля и кнопки. Если пользователя нет — сообщение об ошибке.
export default function Profile({ onClose, onLogout, user, coins }) {
  if (!user) {
    // Если нет пользователя — показываем ошибку
    return (
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.errorText}>Пользователь не найден. Пожалуйста, зарегистрируйтесь заново.</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avatarImages = [
    require("../../assets/images/fox.png"),
    require("../../assets/images/hedgehog.png"),
    require("../../assets/images/hare.png"),
    require("../../assets/images/bear.png"),
    require("../../assets/images/owl.png"),
    require("../../assets/images/wolf.png"),
  ];
  const avatarNames = ["лиса", "ёж", "заяц", "медведь", "сова", "волк"];

  let avatarIdx = typeof user.avatar === "number"
    ? user.avatar
    : avatarNames.indexOf(user.avatar);

  if (avatarIdx < 0) avatarIdx = 0;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Заголовок профиля */}
        <Text style={styles.title}>Профиль</Text>
        {/* Если нет аватарки, показываем заглушку */}
        <Image source={avatarImages[avatarIdx]} style={styles.avatar} />
        <Text style={styles.avatarName}>{avatarNames[avatarIdx]}</Text>
        {/* Имя пользователя */}
        <Text style={styles.name}>{user.name || "Без имени"}</Text>
        {/* Количество мозгокоинов */}
        <Text style={styles.coins}>🧠 {coins} мозгокоинов</Text>
        {/* Телефон пользователя, если есть */}
        {user.phone ? (
          <Text style={styles.info}>Телефон: {user.phone}</Text>
        ) : null}
        {/* ID пользователя */}
        {user.id ? (
          <Text style={styles.id}>ID: {user.id}</Text>
        ) : null}
        {/* Кнопка закрытия профиля */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Закрыть</Text>
        </TouchableOpacity>
        {/* Кнопка выхода из профиля */}
        {onLogout ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Выйти</Text>
          </TouchableOpacity>
        ) : (
          // Если onLogout не передан, родительский компонент должен передавать обработчик выхода
          null
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 32,
    minWidth: 320,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: "#444",
    overflow: "hidden",
  },
  avatarName: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  coins: {
    color: "#ccc",
    marginVertical: 12,
    fontSize: 18,
  },
  info: {
    color: "#aaa",
    marginBottom: 6,
    fontSize: 15,
  },
  id: {
    fontSize: 16,
    color: "#ffd166",
    marginBottom: 6,
  },
  closeBtn: {
    backgroundColor: "#4685ff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});