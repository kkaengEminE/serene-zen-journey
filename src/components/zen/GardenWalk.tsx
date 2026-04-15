import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GardenScene from "./GardenScene";
import AmbientAudio from "./AmbientAudio";
import FootstepEffect from "./FootstepEffect";
import type { PsychProfile } from "./quizAnalysis";
import { getPersonalizedMessages } from "./quizAnalysis";

interface Footstep {
  id: number;
  x: number;
  y: number;
}

interface GardenWalkProps {
  profile: PsychProfile;
  onComplete: () => void;
}

const GardenWalk = ({ profile, onComplete }: GardenWalkProps) => {
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = messages, 6 = transition out
  const [showMessage, setShowMessage] = useState(false);
  const [footsteps, setFootsteps] = useState<Footstep[]>([]);
  const [footstepId, setFootstepId] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);

  const messages = getPersonalizedMessages(profile);
  const totalSteps = messages.length + 1; // +1 for final transition

  // Progress mapped from step (0 to totalSteps)
  const progress = Math.min(step / totalSteps, 1);

  // Show message when step advances (1-5)
  useEffect(() => {
    if (step >= 1 && step <= messages.length) {
      setShowMessage(true);
    }
  }, [step, messages.length]);

  // When progress reaches 1, complete after delay
  useEffect(() => {
    if (step > messages.length) {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, messages.length, onComplete]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Start audio on first interaction
    if (!audioStarted) setAudioStarted(true);

    // Add footstep ripple
    const newId = footstepId + 1;
    setFootstepId(newId);
    setFootsteps((prev) => [...prev.slice(-5), { id: newId, x: e.clientX, y: e.clientY }]);

    // Advance step
    if (step <= messages.length) {
      setShowMessage(false);
      // Small delay before advancing so exit animation plays
      setTimeout(() => {
        setStep((s) => s + 1);
      }, 300);
    }
  }, [step, messages.length, footstepId, audioStarted]);

  const currentMessageIndex = step - 1; // 0-indexed into messages

  return (
    <div className="fixed inset-0 overflow-hidden cursor-pointer" onClick={handleClick}>
      <GardenScene progress={progress} />
      <AmbientAudio isPlaying={audioStarted} volume={0.35} />
      <FootstepEffect footsteps={footsteps} />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="intro"
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <p className="text-sm md:text-base text-foreground/50 font-serif tracking-widest mb-2">
                정원의 길을 걸어보세요
              </p>
              <p className="text-xs text-foreground/30 tracking-[0.2em]">
                화면을 클릭하여 한 걸음씩
              </p>
            </div>
          </motion.div>
        )}

        {showMessage && currentMessageIndex >= 0 && currentMessageIndex < messages.length && (
          <motion.div
            key={`msg-${currentMessageIndex}`}
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 pointer-events-none">
        <div className="h-px bg-foreground/10">
          <motion.div
            className="h-full bg-primary/40"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[10px] text-foreground/30 tracking-[0.3em] font-serif">
            歩 — 걸음
          </p>
          <p className="text-[10px] text-foreground/20">
            {step}/{totalSteps}
          </p>
        </div>
      </div>

      {/* White fade out at the end */}
      {progress > 0.85 && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.min((progress - 0.85) * 6.5, 1) }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
};

export default GardenWalk;
