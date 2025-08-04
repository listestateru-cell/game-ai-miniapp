import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function useCoins() {
  const [coins, setCoins] = useState(0);

  function addCoins(amount) {
    setCoins(prev => prev + amount);
    AsyncStorage.setItem("coins", String(coins + amount));
  }

  function setCoinsDirect(amount) {
    setCoins(amount);
    AsyncStorage.setItem("coins", String(amount));
  }

  async function fetchCoinsFromServer() {
    const stored = await AsyncStorage.getItem("coins");
    if (stored !== null) setCoins(Number(stored));
  }

  return { coins, addCoins, setCoinsDirect, fetchCoinsFromServer };
}