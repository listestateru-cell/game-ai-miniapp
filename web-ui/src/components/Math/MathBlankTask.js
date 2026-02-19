import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function getLevelConfig(level) {
  if (level < 10) return { min: 1, max: 9, ops: ["+"] };
  if (level < 30) return { min: 10, max: 99, ops: ["+", "-"] };
  if (level < 40) return { min: 10, max: 99, ops: ["+", "-", "*"] };
  return { min: 100, max: 999, ops: ["+", "-", "*"] };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateEquations(level = 1, count = 5) {
  const { min, max, ops } = getLevelConfig(level);
  let eqs = [];
  let usedComb = new Set();
  let numbers = [];
  while (eqs.length < count) {
    let op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, sum;
    if (op === "+") {
      a = randInt(min, max - 1);
      b = randInt(min, max - a);
      sum = a + b;
    } else if (op === "-") {
      a = randInt(min + 2, max);
      b = randInt(min, a - min);
      sum = a - b;
    } else if (op === "*") {
      a = randInt(2, Math.min(max, 15));
      b = randInt(2, Math.min(max, 10));
      sum = a * b;
    }
    const sig = `${op}${a},${b}`;
    if (usedComb.has(sig)) continue;
    usedComb.add(sig);
    eqs.push({ op, sum, a: null, b: null, solutionA: a, solutionB: b });
    numbers.push(a, b);
  }
  numbers = shuffle(numbers);
  return { eqs, pool: numbers };
}

export default function MathBlankTask({ onBack, addCoins }) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(() => generateEquations(level));
  const [draggedNum, setDraggedNum] = useState(null);
  const [complete, setComplete] = useState(false);
  // draggedFrom: { fromEq, fromSlot, value } for web, null for pool
  const [draggedFrom, setDraggedFrom] = useState(null);

  useEffect(() => {
    setRound(generateEquations(level));
    setComplete(false);
    setDraggedNum(null);
    setDraggedFrom(null);
  }, [level]);

  // Split pool into two rows for display, always equalize row lengths (web)
  let firstRow, secondRow, maxLen;
  if (Platform.OS === "web") {
    const half = Math.ceil(round.pool.length / 2);
    firstRow = round.pool.slice(0, half);
    secondRow = round.pool.slice(half);
    maxLen = Math.max(firstRow.length, secondRow.length);
  } else {
    const half = Math.ceil(round.pool.length / 2);
    firstRow = round.pool.slice(0, half);
    secondRow = round.pool.slice(half);
  }

  // Web: drag from pool or from any non-green slot
  function isSlotGreen(eq, slot) {
    if (eq[slot] === null) return false;
    if (eq.a !== null && eq.b !== null) {
      if (
        ((eq.op === "+" && eq.a + eq.b === eq.sum) ||
          (eq.op === "-" && eq.a - eq.b === eq.sum) ||
          (eq.op === "*" && eq.a * eq.b === eq.sum))
      ) {
        return true;
      }
    }
    return false;
  }

  // --- WEB Drag-and-Drop mechanics refactor ---
  function handleDragStartWeb(e, idx, value) {
    // Drag from pool
    if (complete) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ fromPoolIdx: idx, value }));
    setDraggedNum({ idx, value });
    setDraggedFrom(null);
  }

  function handleDragStartSlotWeb(e, eqIdx, slot, value) {
    // Drag from slot (not green, i.e., not solved)
    if (complete) return;
    if (isSlotGreen(round.eqs[eqIdx], slot)) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ fromEq: eqIdx, fromSlot: slot, value }));
    setDraggedNum({ value });
    setDraggedFrom({ fromEq: eqIdx, fromSlot: slot, value });
  }

  function handleDropWeb(e, eqIdx, slot) {
    e.preventDefault();
    if (complete) return;
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    // Only allow drop if slot is empty AND not solved (not green)
    if (round.eqs[eqIdx][slot] !== null) return;
    if (isSlotGreen(round.eqs[eqIdx], slot)) return;
    let next = { eqs: round.eqs.map(eq => ({ ...eq })), pool: [...round.pool] };

    // Remove from pool or from another slot
    if (data.fromPoolIdx !== undefined) {
      // From pool
      next.eqs[eqIdx][slot] = data.value;
      next.pool.splice(data.fromPoolIdx, 1);
    } else if (data.fromEq !== undefined && data.fromSlot) {
      // From another slot (any not green slot)
      if (isSlotGreen(round.eqs[data.fromEq], data.fromSlot)) return;
      if (next.eqs[data.fromEq][data.fromSlot] !== data.value) return;
      if (data.fromEq === eqIdx && data.fromSlot === slot) return;
      next.eqs[data.fromEq][data.fromSlot] = null;
      for (let i = 0; i < next.eqs.length; ++i) {
        for (let s of ["a", "b"]) {
          if (i === eqIdx && s === slot) continue;
          if (next.eqs[i][s] === data.value) next.eqs[i][s] = null;
        }
      }
      next.eqs[eqIdx][slot] = data.value;
    } else {
      return;
    }
    setRound(next);
    setDraggedNum(null);
    setDraggedFrom(null);
    setTimeout(() => {
      let done =
        next.eqs.every(eq =>
          eq.a !== null &&
          eq.b !== null &&
          ((eq.op === "+" && eq.a + eq.b === eq.sum) ||
            (eq.op === "-" && eq.a - eq.b === eq.sum) ||
            (eq.op === "*" && eq.a * eq.b === eq.sum))
        );
      if (done) {
        setComplete(true);
        addCoins && addCoins(20);
        setTimeout(() => {
          setLevel(l => l + 1);
        }, 1300);
      }
    }, 100);
  }

  function handleDropToPoolWeb(e) {
    e.preventDefault();
    if (complete) return;
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }
    // Only allow drop if dragging from slot (not from pool)
    if (data.fromEq !== undefined && data.fromSlot) {
      if (isSlotGreen(round.eqs[data.fromEq], data.fromSlot)) return;
      let next = { eqs: round.eqs.map(eq => ({ ...eq })), pool: [...round.pool] };
      if (next.eqs[data.fromEq][data.fromSlot] !== data.value) return;
      for (let i = 0; i < next.eqs.length; ++i) {
        for (let s of ["a", "b"]) {
          if (i === data.fromEq && s === data.fromSlot) continue;
          if (next.eqs[i][s] === data.value) next.eqs[i][s] = null;
        }
      }
      next.eqs[data.fromEq][data.fromSlot] = null;
      next.pool.push(data.value);
      setRound(next);
      setDraggedNum(null);
      setDraggedFrom(null);
    }
  }

  function handleDragOverWeb(e) {
    e.preventDefault();
  }

  // Handlers for RN tap-to-place and tap-to-remove
  function handleSlotPressRN(eqIdx, slot) {
    const eq = round.eqs[eqIdx];
    if (isSlotGreen(eq, slot)) return;
    if (eq[slot] !== null) {
      let next = { eqs: round.eqs.map(eq => ({ ...eq })), pool: [...round.pool] };
      next.pool.push(eq[slot]);
      next.eqs[eqIdx][slot] = null;
      setRound(next);
      setDraggedNum(null);
      return;
    }
    if (draggedNum === null) return;
    if (eq[slot] !== null) return;
    let next = { eqs: round.eqs.map(eq => ({ ...eq })), pool: [...round.pool] };
    next.eqs[eqIdx][slot] = draggedNum.value;
    next.pool.splice(draggedNum.idx, 1);
    setRound(next);
    setDraggedNum(null);
    setTimeout(() => {
      let done =
        next.eqs.every(eq =>
          eq.a !== null &&
          eq.b !== null &&
          ((eq.op === "+" && eq.a + eq.b === eq.sum) ||
            (eq.op === "-" && eq.a - eq.b === eq.sum) ||
            (eq.op === "*" && eq.a * eq.b === eq.sum))
        );
      if (done) {
        setComplete(true);
        addCoins && addCoins(20);
        setTimeout(() => {
          setLevel(l => l + 1);
        }, 1300);
      }
    }, 100);
  }

  function handleNumberPressRN(idx, value) {
    setDraggedNum({ idx, value });
  }

  if (Platform.OS === "web") {
    return (
      <>
        <button style={{
          marginBottom: 24,
          alignSelf: "flex-start",
          background: "#4685ff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          fontWeight: 700,
          fontSize: 17,
          cursor: "pointer"
        }} onClick={onBack}>
          ← Назад
        </button>
      <div
        style={{
          minHeight: "600px",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "56px",
          paddingTop: "24px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#fff",
          userSelect: "none"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "450px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "24px"
          }}
        >
          {round.eqs.map((eq, i) => {
            const correct =
              eq.a !== null && eq.b !== null &&
              ((eq.op === "+" && eq.a + eq.b === eq.sum) ||
                (eq.op === "-" && eq.a - eq.b === eq.sum) ||
                (eq.op === "*" && eq.a * eq.b === eq.sum));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px"
                }}
              >
        <div
          style={{
            width: "58px",
            height: "58px",
            background: eq.a !== null && correct ? "#ffe066" : "transparent",
            border: `2px solid ${eq.a !== null && correct ? "#ffe066" : "#fff"}`,
            borderRadius: "11px",
            margin: "0 2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              eq.a !== null && !isSlotGreen(eq, "a") && !complete
                ? "grab"
                : "default"
          }}
          onDrop={e => handleDropWeb(e, i, "a")}
          onDragOver={handleDragOverWeb}
          draggable={false}
        >
          <span
            draggable={eq.a !== null && !isSlotGreen(eq, "a") && !complete}
            onDragStart={
              eq.a !== null && !isSlotGreen(eq, "a") && !complete
                ? e => {
                    e.stopPropagation();
                    handleDragStartSlotWeb(e, i, "a", eq.a);
                  }
                : undefined
            }
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: eq.a !== null && correct ? "#222" : "#fff",
              cursor:
                eq.a !== null && !isSlotGreen(eq, "a") && !complete
                  ? "grab"
                  : "default"
            }}
          >
            {eq.a !== null ? eq.a : ""}
          </span>
        </div>
                <span
                  style={{
                    fontSize: "32px",
                    width: "34px",
                    textAlign: "center",
                    color: "#fff",
                    userSelect: "none"
                  }}
                >
                  {eq.op}
                </span>
        <div
          style={{
            width: "58px",
            height: "58px",
            background: eq.b !== null && correct ? "#ffe066" : "transparent",
            border: `2px solid ${eq.b !== null && correct ? "#ffe066" : "#fff"}`,
            borderRadius: "11px",
            margin: "0 2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              eq.b !== null && !isSlotGreen(eq, "b") && !complete
                ? "grab"
                : "default"
          }}
          onDrop={e => handleDropWeb(e, i, "b")}
          onDragOver={handleDragOverWeb}
          draggable={false}
        >
          <span
            draggable={eq.b !== null && !isSlotGreen(eq, "b") && !complete}
            onDragStart={
              eq.b !== null && !isSlotGreen(eq, "b") && !complete
                ? e => {
                    e.stopPropagation();
                    handleDragStartSlotWeb(e, i, "b", eq.b);
                  }
                : undefined
            }
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: eq.b !== null && correct ? "#222" : "#fff",
              cursor:
                eq.b !== null && !isSlotGreen(eq, "b") && !complete
                  ? "grab"
                  : "default"
            }}
          >
            {eq.b !== null ? eq.b : ""}
          </span>
        </div>
                <span
                  style={{
                    fontSize: "32px",
                    width: "34px",
                    textAlign: "center",
                    color: "#fff",
                    userSelect: "none"
                  }}
                >
                  =
                </span>
                <span
                  style={{
                    fontSize: "28px",
                    width: "50px",
                    textAlign: "right",
                    color: correct ? "#46e17e" : "#fff",
                    fontWeight: correct ? 800 : 600,
                    userSelect: "none"
                  }}
                >
                  {eq.sum}
                </span>
              </div>
            );
          })}
        </div>
        {/* Pool displayed in two visually equal rows (web) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "95%",
            maxWidth: "450px",
            marginBottom: "12px"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginBottom: 0,
              gap: 0,
            }}
            onDrop={handleDropToPoolWeb}
            onDragOver={handleDragOverWeb}
          >
            {firstRow.map((num, idx) => (
              <div
                key={idx}
                draggable={!complete}
                onDragStart={
                  !complete
                    ? e => handleDragStartWeb(e, idx, num)
                    : undefined
                }
                style={{
                  width: "54px",
                  height: "54px",
                  background: "#23232b",
                  borderRadius: "11px",
                  border: "2px solid #fff",
                  margin: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: !complete ? "grab" : "default"
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "25px" }}>{num}</span>
              </div>
            ))}
            {/* Fillers for alignment */}
            {Array(maxLen - firstRow.length)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`empty1-${i}`}
                  style={{
                    width: "54px",
                    height: "54px",
                    margin: "0 4px",
                    background: "transparent",
                  }}
                />
              ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginTop: "4px",
              gap: 0,
            }}
            onDrop={handleDropToPoolWeb}
            onDragOver={handleDragOverWeb}
          >
            {secondRow.map((num, idx) => (
              <div
                key={idx}
                draggable={!complete}
                onDragStart={
                  !complete
                    ? e => handleDragStartWeb(e, idx + firstRow.length, num)
                    : undefined
                }
                style={{
                  width: "54px",
                  height: "54px",
                  background: "#23232b",
                  borderRadius: "11px",
                  border: "2px solid #fff",
                  margin: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: !complete ? "grab" : "default"
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "25px" }}>{num}</span>
              </div>
            ))}
            {/* Fillers for alignment */}
            {Array(maxLen - secondRow.length)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`empty2-${i}`}
                  style={{
                    width: "54px",
                    height: "54px",
                    margin: "0 4px",
                    background: "transparent",
                  }}
                />
              ))}
          </div>
        </div>
        {complete && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "120px",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none"
            }}
          >
            <span
              style={{
                fontSize: "34px",
                color: "#2ed573",
                fontWeight: 700,
                textShadow: "0 2px 10px #000b",
                userSelect: "none"
              }}
            >
              ✅ Всё верно! +20 🧠
            </span>
          </div>
        )}
      </div>
      </>
    );
  }

  // React Native branch
  return (
    <ScrollView contentContainerStyle={styles.layout}>
      <TouchableOpacity
        style={{
          marginTop: 12,
          marginBottom: 8,
          alignSelf: "flex-start",
          backgroundColor: "#4685ff",
          borderRadius: 8,
          paddingVertical: 7,
          paddingHorizontal: 18,
        }}
        onPress={onBack}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>← Назад</Text>
      </TouchableOpacity>
      <View style={styles.poolWrap}>
        {round.eqs.map((eq, i) => {
          const correct =
            eq.a !== null && eq.b !== null &&
            ((eq.op === "+" && eq.a + eq.b === eq.sum) ||
              (eq.op === "-" && eq.a - eq.b === eq.sum) ||
              (eq.op === "*" && eq.a * eq.b === eq.sum));
          return (
            <View key={i} style={styles.eqRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSlotPressRN(i, "a")}
                style={[
                  styles.blankSlot,
                  eq.a !== null && correct ? { backgroundColor: "#ffe066", borderColor: "#ffe066" } : {}
                ]}
              >
                <Text style={[
                  styles.blankSlotText,
                  eq.a !== null && correct ? { color: "#222" } : {}
                ]}>
                  {eq.a !== null ? eq.a : ""}
                </Text>
              </TouchableOpacity>
              <Text style={styles.eqOp}>{eq.op}</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleSlotPressRN(i, "b")}
                style={[
                  styles.blankSlot,
                  eq.b !== null && correct ? { backgroundColor: "#ffe066", borderColor: "#ffe066" } : {}
                ]}
              >
                <Text style={[
                  styles.blankSlotText,
                  eq.b !== null && correct ? { color: "#222" } : {}
                ]}>
                  {eq.b !== null ? eq.b : ""}
                </Text>
              </TouchableOpacity>
              <Text style={styles.eqOp}>=</Text>
              <Text style={[styles.eqSum, correct && styles.eqSumCorrect]}>{eq.sum}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.poolRow}>
        {firstRow.map((num, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleNumberPressRN(idx, num)}
            style={styles.numberCell}
          >
            <Text style={styles.numberCellText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.poolRow}>
        {secondRow.map((num, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleNumberPressRN(idx + firstRow.length, num)}
            style={styles.numberCell}
          >
            <Text style={styles.numberCellText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {complete && (
        <View style={styles.completeMsg}>
          <Text style={styles.completeMsgText}>✅ Всё верно! +20 🧠</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  layout: {
    minHeight: 600,
    backgroundColor: "#000",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 56,
    paddingTop: 24,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#fff",
    userSelect: "none",
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  poolWrap: {
    width: "100%",
    maxWidth: 450,
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  eqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  eqOp: {
    fontSize: 32,
    width: 34,
    textAlign: "center",
    color: "#fff",
    userSelect: "none",
  },
  eqSum: {
    fontSize: 28,
    width: 50,
    textAlign: "right",
    color: "#fff",
    fontWeight: "600",
    userSelect: "none",
  },
  eqSumCorrect: {
    color: "#46e17e",
    fontWeight: "800",
  },
  poolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    maxWidth: 450,
    marginBottom: 12,
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  numberCell: {
    width: 54,
    height: 54,
    backgroundColor: "#23232b",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    marginHorizontal: 4,
    marginVertical: 0,
    display: Platform.OS === "web" ? "flex" : undefined,
    cursor: Platform.OS === "web" ? "grab" : undefined,
  },
  numberCellText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 25,
  },
  blankSlot: {
    width: 58,
    height: 58,
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
    marginRight: 2,
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  blankSlotText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  completeMsg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 120,
    alignItems: "center",
    pointerEvents: "none",
    display: Platform.OS === "web" ? "flex" : undefined,
  },
  completeMsgText: {
    fontSize: 34,
    color: "#2ed573",
    fontWeight: "700",
    textShadowColor: "#000b",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    userSelect: "none",
  },
});