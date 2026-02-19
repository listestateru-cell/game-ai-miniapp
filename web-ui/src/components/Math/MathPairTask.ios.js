import { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";

function generatePairs(count = 5) {
  let tasks = [];
  let answers = [];
  for (let i = 0; i < count; i++) {
    let a = Math.floor(Math.random() * 15) + 1;
    let b = Math.floor(Math.random() * 15) + 1;
    tasks.push({ q: `${a} + ${b}`, ans: a + b });
    answers.push(a + b);
  }
  answers = shuffle(answers);
  return { tasks, answers };
}
function shuffle(arr) {
  let copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MathPairTaskIOS({ addCoins, questMode, onFinish }) {
  const [pairs, setPairs] = useState(generatePairs());
  const [connections, setConnections] = useState([]); // {from, to}
  const [complete, setComplete] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);

  const leftRefs = useRef([]);
  const rightRefs = useRef([]);
  const [leftCenters, setLeftCenters] = useState([]);
  const [rightCenters, setRightCenters] = useState([]);
  const width = Dimensions.get("window").width;
  const height = Math.max(Dimensions.get("window").height * 0.7, 500);

  // Обновление координат
  const updateCenters = () => {
    Promise.all([
      Promise.all(
        leftRefs.current.map(
          (ref) =>
            new Promise((resolve) => {
              if (!ref) return resolve(null);
              ref.measure((fx, fy, w, h, px, py) => {
                resolve({ x: px + w / 2, y: py + h / 2 });
              });
            })
        )
      ),
      Promise.all(
        rightRefs.current.map(
          (ref) =>
            new Promise((resolve) => {
              if (!ref) return resolve(null);
              ref.measure((fx, fy, w, h, px, py) => {
                resolve({ x: px + w / 2, y: py + h / 2 });
              });
            })
        )
      ),
    ]).then(([lefts, rights]) => {
      setLeftCenters(lefts);
      setRightCenters(rights);
    });
  };

  useEffect(() => {
    setTimeout(updateCenters, 400); // после layout
  }, [pairs, complete]);

  // Событие: выбор левой
  const handleSelectLeft = (idx) => {
    if (connections.some((c) => c.from === idx)) return;
    setSelectedLeft(idx);
  };

  // Событие: выбор правой
  const handleSelectRight = (idx) => {
    if (selectedLeft === null) return;
    if (connections.some((c) => c.to === idx)) return;
    // Проверяем правильность пары
    if (pairs.tasks[selectedLeft].ans === pairs.answers[idx]) {
      setConnections((prev) => [...prev, { from: selectedLeft, to: idx }]);
      setSelectedLeft(null);
      // Если всё закончено:
      if (connections.length + 1 === pairs.tasks.length) {
        setComplete(true);
        addCoins && addCoins(10);
        setShowCompleteMessage(true);
        setTimeout(() => {
          setShowCompleteMessage(false);
          if (questMode && onFinish) {
            setComplete(false);
            onFinish();
          } else {
            setPairs(generatePairs());
            setConnections([]);
            setComplete(false);
          }
        }, 1200);
      }
    } else {
      setSelectedLeft(null);
    }
  };

  // Элементные размеры и отступы
  const elementWidth = 80;
  const elementHeight = 40;
  const verticalSpacing = 24;
  const columnSpacing = width - elementWidth * 2 - 40;
  const containerWidth = width;
  const containerHeight = pairs.tasks.length * elementHeight + (pairs.tasks.length - 1) * verticalSpacing;

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.svgContainer, { width: containerWidth, height: containerHeight, paddingHorizontal: 20 }]}>
        <Svg height={containerHeight} width={containerWidth} style={StyleSheet.absoluteFill}>
          {/* Соединённые линии */}
          {connections.map(({ from, to }, idx) => {
            if (!leftCenters[from] || !rightCenters[to]) return null;
            return (
              <Polyline
                key={idx}
                points={[
                  `${leftCenters[from].x},${leftCenters[from].y}`,
                  `${rightCenters[to].x},${rightCenters[to].y}`,
                ].join(" ")}
                fill="none"
                stroke="#fff"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>
        {/* Колонки */}
        <View style={[styles.columnsContainer, { width: containerWidth, height: containerHeight }]}>
          {/* Левая */}
          <View style={[styles.column, { width: elementWidth, height: containerHeight, marginRight: columnSpacing }]}>
            {pairs.tasks.map((task, i) => {
              const connected = connections.some((c) => c.from === i);
              return (
                <TouchableOpacity
                  key={i}
                  ref={(ref) => (leftRefs.current[i] = ref)}
                  style={[
                    styles.leftItem,
                    connected && styles.leftItemConnected,
                    selectedLeft === i && { borderColor: "#2ed573", borderWidth: 3 },
                    { width: elementWidth, height: elementHeight, marginBottom: i === pairs.tasks.length - 1 ? 0 : verticalSpacing },
                  ]}
                  disabled={connected}
                  onPressIn={() => handleSelectLeft(i)}
                >
                  <Text style={[styles.leftText, connected && styles.leftTextConnected]}>{task.q}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Правая */}
          <View style={[styles.column, { width: elementWidth, height: containerHeight, marginLeft: 0, position: 'absolute', right: 20, top: 0 }]}>
            {pairs.answers.map((ans, i) => {
              const connected = connections.some((c) => c.to === i);
              return (
                <TouchableOpacity
                  key={i}
                  ref={(ref) => (rightRefs.current[i] = ref)}
                  style={[
                    styles.rightItem,
                    connected && styles.rightItemConnected,
                    { width: elementWidth, height: elementHeight, marginBottom: i === pairs.answers.length - 1 ? 0 : verticalSpacing },
                  ]}
                  disabled={connected}
                  onPressIn={() => handleSelectRight(i)}
                >
                  <Text style={[styles.rightText, connected && styles.rightTextConnected]}>{ans}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
      {showCompleteMessage && (
        <View style={styles.completeView}>
          <Text style={styles.completeText}>✅ +10 🧠</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  svgContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  columnsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  column: {
    justifyContent: "center",
  },
  leftItem: {
    backgroundColor: "#ffe066",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#c4b161",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  leftItemConnected: {
    backgroundColor: "#c4b161",
    opacity: 0.7,
  },
  leftText: {
    color: "#222",
    fontWeight: "700",
    fontSize: 18,
  },
  leftTextConnected: {
    color: "#444",
  },
  rightItem: {
    backgroundColor: "#5271ff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#395be3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  rightItemConnected: {
    backgroundColor: "#395be3",
    opacity: 0.7,
  },
  rightText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  rightTextConnected: {
    color: "#cfd6ff",
  },
  completeView: {
    position: "absolute",
    top: 140,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  completeText: {
    fontSize: 40,
    color: "#2ed573",
    fontWeight: "700",
    textShadowColor: "#000",
    textShadowRadius: 8,
  },
});