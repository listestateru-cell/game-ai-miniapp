// Компонент MathPairTask реализует раздельную логику для web и React Native (iOS/Android) платформ.
// Пожалуйста, не объединяйте код для разных платформ в один, чтобы избежать проблем с производительностью и совместимостью.

import React, { useEffect, useRef, useState } from "react";
import { Dimensions, PanResponder, Platform, Text, TouchableOpacity, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";

function generatePairs(count = 5) {
  let tasks = [];
  let answers = [];
  for (let i = 0; i < count; i++) {
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;
    tasks.push({ q: `${a} + ${b}`, ans: a + b });
    answers.push(a + b);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  return { tasks, answers };
}

const isWeb = typeof window !== "undefined" && Platform.OS === "web";

export function MathPairTaskWeb({ onBack, addCoins, questMode, onFinish }) {
  const [pairs, setPairs] = useState(generatePairs());
  const [connections, setConnections] = useState([]); // [{from, to, points: [{x,y}]}]
  const [complete, setComplete] = useState(false);

  const [drag, setDrag] = useState(null); // {fromIdx}
  const [dragPath, setDragPath] = useState([]); // array of points {x,y}
  const width = Dimensions.get("window").width;
  const height = Math.max(Dimensions.get("window").height * 0.7, 500);

  // refs for coords
  const tasksRefs = useRef([]);
  const answersRefs = useRef([]);
  const containerRef = useRef();

  function getBlockCenter(ref) {
    if (!ref || !containerRef.current) return { x: 0, y: 0 };
    const rect = ref.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top,
    };
  }

  const onTaskMouseDown = (e, idx) => {
    if (connections.some((c) => c.from === idx)) return;
    const { x, y } = getBlockCenter(tasksRefs.current[idx]);
    setDrag({ fromIdx: idx });
    setDragPath([{ x, y }]);
    e.preventDefault();
  };

  useEffect(() => {
    if (!drag) return;

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setDragPath((prev) => [
        ...prev,
        {
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        },
      ]);
    };

    const onMouseUp = (e) => {
      if (!drag) return;
      let found = null;
      answersRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom &&
          !connections.some((c) => c.to === idx)
        ) {
          found = idx;
        }
      });
      if (found !== null) {
        // check answer
        if (pairs.tasks[drag.fromIdx].ans === pairs.answers[found]) {
          setConnections((prev) => [
            ...prev,
            {
              from: drag.fromIdx,
              to: found,
              points: dragPath,
            },
          ]);
          if (connections.length + 1 === pairs.tasks.length) {
            setTimeout(() => {
              setComplete(true);
              addCoins && addCoins(10);
              if (questMode && onFinish) {
                setTimeout(() => {
                  setComplete(false);
                  onFinish();
                }, 1200);
              } else {
                setTimeout(() => {
                  setPairs(generatePairs());
                  setConnections([]);
                  setComplete(false);
                }, 1200);
              }
            }, 350);
          }
        }
      }
      setDrag(null);
      setDragPath([]);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [drag, dragPath, connections, pairs, complete, addCoins, questMode, onFinish]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: height,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <svg
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
        width={containerRef.current?.offsetWidth || width}
        height={containerRef.current?.offsetHeight || height}
      >
        {connections.map((conn, idx) => (
          <Polyline
            key={idx}
            points={conn.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
        {drag && dragPath.length > 0 && (
          <Polyline
            points={dragPath.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#aaa"
            strokeWidth={3}
            strokeDasharray="8,7"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div
        style={{
          width: width * 0.92,
          maxWidth: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          {pairs.tasks.map((task, i) => (
            <div
              key={i}
              ref={(el) => (tasksRefs.current[i] = el)}
              onMouseDown={(e) => onTaskMouseDown(e, i)}
              style={{
                width: 120,
                height: 44,
                backgroundColor: connections.some((c) => c.from === i) ? "#c4b161" : "#ffe066",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "16px 0",
                fontWeight: "700",
                fontSize: 22,
                color: "#222",
                cursor: connections.some((c) => c.from === i) ? "default" : "grab",
                userSelect: "none",
              }}
            >
              {task.q}
            </div>
          ))}
        </div>
        <div>
          {pairs.answers.map((ans, i) => (
            <div
              key={i}
              ref={(el) => (answersRefs.current[i] = el)}
              style={{
                width: 90,
                height: 44,
                backgroundColor: connections.some((c) => c.to === i) ? "#395be3" : "#5271ff",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "16px 0",
                fontWeight: "700",
                fontSize: 20,
                color: "#fff",
                userSelect: "none",
              }}
            >
              {ans}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onBack}
        style={{
          marginTop: 30,
          alignSelf: "center",
          backgroundColor: "#4685ff",
          borderRadius: 10,
          padding: "14px 34px",
          color: "#fff",
          fontSize: 18,
          border: "none",
          cursor: "pointer",
          userSelect: "none",
        }}
        type="button"
      >
        Назад
      </button>
      {complete && (
        <div
          style={{
            color: "#2ed573",
            fontWeight: "700",
            fontSize: 24,
            marginTop: 30,
            textAlign: "center",
            userSelect: "none",
          }}
        >
          ✅ Всё верно! +10 🧠
        </div>
      )}
    </div>
  );
}

export default function MathPairTask({ onBack, addCoins, questMode, onFinish }) {
  if (isWeb) {
    return <MathPairTaskWeb onBack={onBack} addCoins={addCoins} questMode={questMode} onFinish={onFinish} />;
  }

  // --- RN ---
  const [pairs, setPairs] = useState(generatePairs());
  const [connections, setConnections] = useState([]); // [{from, to, fromPos, toPos}]
  const [complete, setComplete] = useState(false);
  const [drag, setDrag] = useState(null); // {fromIdx, x1, y1, x2, y2}
  const width = Dimensions.get("window").width;
  const height = Math.max(Dimensions.get("window").height * 0.7, 500);

  const tasksRefs = useRef([]);
  const answersRefs = useRef([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        for (let i = 0; i < tasksRefs.current.length; i++) {
          tasksRefs.current[i]?.measure((fx, fy, w, h, px, py) => {
            if (
              locationX >= px &&
              locationX <= px + w &&
              locationY >= py &&
              locationY <= py + h &&
              !connections.some((c) => c.from === i)
            ) {
              setDrag({
                fromIdx: i,
                x1: px + w / 2,
                y1: py + h / 2,
                x2: px + w / 2,
                y2: py + h / 2,
              });
            }
          });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!drag) return;
        setDrag((d) => ({
          ...d,
          x2: gestureState.moveX,
          y2: gestureState.moveY,
        }));
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!drag) return;
        let found = null;
        answersRefs.current.forEach((ref, idx) => {
          ref?.measure((fx, fy, w, h, px, py) => {
            if (
              gestureState.moveX >= px - 8 &&
              gestureState.moveX <= px + w + 8 &&
              gestureState.moveY >= py - 8 &&
              gestureState.moveY <= py + h + 8 &&
              !connections.some((c) => c.to === idx)
            ) {
              found = idx;
            }
          });
        });
        setTimeout(() => {
          if (found !== null && pairs.tasks[drag.fromIdx].ans === pairs.answers[found]) {
            setConnections((prev) => [
              ...prev,
              {
                from: drag.fromIdx,
                to: found,
                fromPos: { x: drag.x1, y: drag.y1 },
                toPos: { x: answersRefs.current[found].x, y: answersRefs.current[found].y },
              },
            ]);
            if (connections.length + 1 === pairs.tasks.length) {
              setTimeout(() => {
                setComplete(true);
                addCoins && addCoins(10);
                if (questMode && onFinish) {
                  setTimeout(() => {
                    setComplete(false);
                    onFinish();
                  }, 1200);
                } else {
                  setTimeout(() => {
                    setPairs(generatePairs());
                    setConnections([]);
                    setComplete(false);
                  }, 1200);
                }
              }, 350);
            }
          }
          setDrag(null);
        }, 10);
      },
    })
  ).current;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...panResponder.panHandlers}
    >
      <Svg
        height={height}
        width={width}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {connections.map((conn, idx) => (
          <Line
            key={idx}
            x1={conn.fromPos.x}
            y1={conn.fromPos.y}
            x2={conn.toPos.x}
            y2={conn.toPos.y}
            stroke="#fff"
            strokeWidth={4}
          />
        ))}
        {drag && (
          <Line
            x1={drag.x1}
            y1={drag.y1}
            x2={drag.x2}
            y2={drag.y2}
            stroke="#aaa"
            strokeWidth={3}
            strokeDasharray="8,7"
          />
        )}
      </Svg>
      <View
        style={{
          flexDirection: "row",
          width: width * 0.92,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          {pairs.tasks.map((task, i) => (
            <View
              key={i}
              ref={(el) => (tasksRefs.current[i] = el)}
              style={{
                width: 120,
                height: 44,
                backgroundColor: connections.some((c) => c.from === i) ? "#c4b161" : "#ffe066",
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 16,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 22, color: "#222" }}>{task.q}</Text>
            </View>
          ))}
        </View>
        <View>
          {pairs.answers.map((ans, i) => (
            <View
              key={i}
              ref={(el) => (answersRefs.current[i] = el)}
              style={{
                width: 90,
                height: 44,
                backgroundColor: connections.some((c) => c.to === i) ? "#395be3" : "#5271ff",
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 16,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 20, color: "#fff" }}>{ans}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={{
          marginTop: 30,
          alignSelf: "center",
          backgroundColor: "#4685ff",
          borderRadius: 10,
          paddingHorizontal: 34,
          paddingVertical: 14,
        }}
        onPress={onBack}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>Назад</Text>
      </TouchableOpacity>
      {complete && (
        <Text style={{ color: "#2ed573", fontWeight: "700", fontSize: 24, marginTop: 30, textAlign: "center" }}>
          ✅ Всё верно! +10 🧠
        </Text>
      )}
    </View>
  );
}