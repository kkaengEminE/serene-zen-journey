import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StartScreen from "@/components/zen/StartScreen";
import QuizScreen, { type QuizAnswer } from "@/components/zen/QuizScreen";
import GardenWalk from "@/components/zen/GardenWalk";
import FinaleScreen from "@/components/zen/FinaleScreen";

type AppPhase = "start" | "quiz" | "garden" | "finale";

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("start");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleQuizComplete = useCallback((quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    setPhase("garden");
  }, []);

  const handleGardenComplete = useCallback(() => {
    setPhase("finale");
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers([]);
    setPhase("start");
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "start" && (
          <motion.div key="start" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <StartScreen onStart={() => setPhase("quiz")} />
          </motion.div>
        )}
        {phase === "quiz" && (
          <motion.div key="quiz" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <QuizScreen onComplete={handleQuizComplete} />
          </motion.div>
        )}
        {phase === "garden" && (
          <motion.div key="garden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
            <GardenWalk answers={answers} onComplete={handleGardenComplete} />
          </motion.div>
        )}
        {phase === "finale" && (
          <motion.div key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <FinaleScreen onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
