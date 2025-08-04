// src/components/MathBrainQuest.js
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MathBlankTask from "./MathBlankTask";
import MathChooseTask from "./MathChooseTask";
import MathEnterTask from "./MathEnterTask";
import MathPairTask from "./MathPairTask";
import MathstoryTask from "./MathstoryTask";

const QUEST_STEPS = [
  MathEnterTask,
  MathChooseTask,
  MathPairTask,
  MathBlankTask,
  MathstoryTask,
];

export default function MathBrainQuest({ onBack, addCoins }) {
  const [step, setStep] = useState(0);

  const StepComponent = QUEST_STEPS[step];

  function nextStep() {
    if (step < QUEST_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      addCoins && addCoins(100);
      // alert замените на Alert для RN, если нужно
      if (typeof window !== "undefined" && window.alert) {
        alert("Поздравляем! Вы прошли мозго-квест и получили супер-приз!");
      }
      onBack && onBack();
    }
  }

  return (
    <View style={styles.container}>
      <StepComponent
        onBack={onBack}
        addCoins={addCoins}
        onFinish={nextStep}
        questMode={true}
      />
      <Text style={styles.stepText}>
        Этап {step + 1} из {QUEST_STEPS.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
  },
  stepText: {
    textAlign: "center",
    color: "#888",
    marginTop: 16,
    fontSize: 18,
  },
});