import * as FileSystem from "expo-file-system";

let db = null;

export async function loadOzhegovDb() {
  if (db) return db;

  let text = "";

  // Для web
  if (typeof window !== "undefined" && window.fetch) {
    try {
      const res = await fetch("/OZHEGOV.TXT");
      text = await res.text();
      console.log("OZHEGOV.TXT (web) длина:", text.length, "начало:", text.slice(0, 200));
    } catch (e) {
      console.warn("Не удалось загрузить OZHEGOV.TXT для web:", e);
      text = "";
    }
  } else {
    // Для Expo/React Native
    try {
      // Абсолютный путь к файлу в assets
      const assetUri = FileSystem.bundleDirectory + "assets/OZHEGOV.TXT";
      text = await FileSystem.readAsStringAsync(assetUri, { encoding: FileSystem.EncodingType.UTF8 });
      console.log("OZHEGOV.TXT (native) длина:", text.length, "начало:", text.slice(0, 200));
    } catch (e) {
      console.warn("Не удалось загрузить OZHEGOV.TXT для native:", e);
      text = "";
    }
  }

  db = parseOzhegov(text);
  return db;
}

function parseOzhegov(text) {
  const map = {};
  // Берём всё до первой запятой как ключ
  const regex = /^([А-ЯЁа-яё0-9\-\.\(\) ]+?),/gm;
  let lastIndex = 0;
  let match;
  let prevKey = null;

  while ((match = regex.exec(text)) !== null) {
    // Убираем цифры в конце (например, ГУБКА1 → ГУБКА)
    const cleanKey = match[1].replace(/\d+$/, "").trim().toUpperCase();
    if (prevKey) {
      // Если слово уже есть — объединяем значения
      if (map[prevKey.key]) {
        map[prevKey.key] += "\n" + text.substring(lastIndex, match.index).trim();
      } else {
        map[prevKey.key] = text.substring(lastIndex, match.index).trim();
      }
    }
    prevKey = { key: cleanKey, idx: match.index };
    lastIndex = regex.lastIndex;
  }
  if (prevKey) {
    if (map[prevKey.key]) {
      map[prevKey.key] += "\n" + text.substring(lastIndex).trim();
    } else {
      map[prevKey.key] = text.substring(lastIndex).trim();
    }
  }
  return map;
}