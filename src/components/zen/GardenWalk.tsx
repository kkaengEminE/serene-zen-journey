import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GardenScene from "./GardenScene";
import type { QuizAnswer } from "./QuizScreen";

interface GardenWalkProps {
  answers: QuizAnswer[];
  onComplete: () => void;
}

const healingMessages: Record<string, string[]> = {
  calm: [
    "당신의 고요함은 이미 깊은 곳에 존재합니다",
    "바람이 지나가듯, 모든 것은 흘러갑니다",
    "이 순간, 당신은 충분합니다",
    "고요함 속에서 당신의 본래 모습을 만나세요",
  ],
  warmth: [
    "당신은 따뜻한 빛을 받을 자격이 있습니다",
    "상처 위에 내리는 햇살처럼, 치유는 찾아옵니다",
    "마음이 따뜻해질 때, 세상도 따뜻해집니다",
    "당신의 부드러움은 강함입니다",
  ],
  strength: [
    "흔들림 속에서도 당신의 뿌리는 깊습니다",
    "산은 바람에 흔들리지 않습니다",
    "지금의 시련은 내일의 지혜가 됩니다",
    "당신 안의 힘을 믿으세요",
  ],
  freedom: [
    "놓아줄 때, 비로소 자유가 찾아옵니다",
    "새처럼, 하늘에는 경계가 없습니다",
    "과거의 무게를 내려놓으세요",
    "당신의 길은 이미 열려 있습니다",
  ],
};

function getMessageSet(answers: QuizAnswer[]): string[] {
  // Determine dominant theme from answers
  const lastAnswer = answers[answers.length - 1]?.answerIndex ?? 0;
  const thirdAnswer = answers[2]?.answerIndex ?? 0;

  if (thirdAnswer === 0) return healingMessages.calm;
  if (thirdAnswer === 1) return healingMessages.warmth;
  if (lastAnswer === 0 || lastAnswer === 2) return healingMessages.freedom;
  return healingMessages.strength;
}

const GardenWalk = ({ answers, onComplete }: GardenWalkProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [showMessage, setShowMessage] = useState(false);

  const messages = getMessageSet(answers);

  // Progress animation: 0 → 1 over ~20 seconds
  useEffect(() => {
    const duration = 22000;
    const start = Date.now();
    let animFrame: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      if (p < 1) {
        animFrame = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 1500);
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [onComplete]);

  // Show messages at intervals
  useEffect(() => {
    const thresholds = [0.15, 0.35, 0.55, 0.72];
    const idx = thresholds.filter((t) => progress >= t).length - 1;

    if (idx >= 0 && idx !== currentMessageIndex) {
      setCurrentMessageIndex(idx);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3500);
    }
  }, [progress, currentMessageIndex]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* 3D Garden */}
      <GardenScene progress={progress} />

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Healing messages */}
      <AnimatePresence>
        {showMessage && currentMessageIndex >= 0 && currentMessageIndex < messages.length && (
          <motion.div
            key={currentMessageIndex}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="text-lg md:text-2xl font-serif text-foreground/90 text-center px-8 max-w-md leading-relaxed drop-shadow-lg">
              {messages[currentMessageIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator — subtle line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32">
        <div className="h-px bg-foreground/10">
          <motion.div
            className="h-full bg-primary/40"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-center text-[10px] text-foreground/30 mt-2 tracking-[0.3em] font-serif">
          歩 — 걸음
        </p>
      </div>

      {/* Bright flash at end */}
      {progress > 0.9 && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min((progress - 0.9) * 10, 1) }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
};

export default GardenWalk;
