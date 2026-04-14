import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StartScreenProps {
  onStart: () => void;
}

const ZenInfoModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-w-lg mx-6 p-8 border border-border rounded-lg bg-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-serif mb-4 text-primary">禪 — Zen이란?</h2>
          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
            <p>
              Zen(禪)은 일본의 선불교 전통에서 비롯된 명상 수행입니다.
              마음을 비우고, 현재 이 순간에 온전히 머무르는 것을 추구합니다.
            </p>
            <p>
              枯山水(가레산스이) — 물 없이 자갈과 돌만으로 자연의 본질을 표현한
              일본 정원입니다. 자갈 위의 파문은 물결을, 돌은 산을 상징합니다.
            </p>
            <p>
              水琴窟(스이킨쿠츠) — 땅 속에 묻힌 항아리에 물방울이 떨어지며
              맑은 공명음을 내는 일본 전통 장치입니다. 그 소리는 마음을
              고요하게 합니다.
            </p>
            <p className="text-primary/70 italic">
              "생각하지 않는 것을 생각하라. 그것이 좌선의 핵심이다." — 도겐 선사
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 border border-border rounded text-sm text-foreground/60 hover:text-foreground hover:border-primary/50 transition-colors"
          >
            닫기
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Ensō circle */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-24 h-24 mx-auto mb-8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="0 1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.92 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </motion.svg>

        <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wider text-foreground mb-3">
          内なる静寂
        </h1>
        <p className="text-sm text-muted-foreground tracking-widest mb-12">
          INNER SILENCE — 내면의 고요
        </p>

        <motion.button
          onClick={onStart}
          className="block mx-auto px-12 py-3 border border-primary/40 rounded-sm text-primary font-serif tracking-widest text-sm hover:bg-primary/10 transition-all duration-500 mb-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          시작하기
        </motion.button>

        <button
          onClick={() => setShowInfo(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider"
        >
          Zen 스타일이란?
        </button>
      </motion.div>

      <ZenInfoModal open={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
};

export default StartScreen;
