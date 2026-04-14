import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GardenScene from "./GardenScene";
import type { PsychProfile } from "./quizAnalysis";
import { getPersonalizedMessages } from "./quizAnalysis";

interface GardenWalkProps {
  profile: PsychProfile;
  onComplete: () => void;
}

const GardenWalk = ({ profile, onComplete }: GardenWalkProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const [showMessage, setShowMessage] = useState(false);

  const messages = getPersonalizedMessages(profile);

  // Progress animation: 0 → 1 over ~24 seconds (slightly longer for 5 messages)
  useEffect(() => {
    const duration = 26000;
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

  // Show messages at intervals (5 messages now)
  useEffect(() => {
    const thresholds = [0.1, 0.25, 0.42, 0.58, 0.74];
    const idx = thresholds.filter((t) => progress >= t).length - 1;

    if (idx >= 0 && idx !== currentMessageIndex) {
      setCurrentMessageIndex(idx);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3500);
    }
  }, [progress, currentMessageIndex]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <GardenScene progress={progress} />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />

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

      {/* Progress indicator */}
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
