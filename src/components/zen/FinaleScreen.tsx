import { motion } from "framer-motion";
import { useMemo } from "react";
import type { PsychProfile } from "./quizAnalysis";
import { getFinaleMessage, getRecommendedLandscape } from "./quizAnalysis";

interface FinaleScreenProps {
  profile: PsychProfile;
  onRestart: () => void;
}

const landscapes = [
  {
    name: "지중해의 수평선",
    subtitle: "Mare Nostrum",
    gradient: "from-sky-200 via-blue-300 to-blue-500",
    groundGradient: "from-blue-400 via-blue-500 to-blue-700",
    skyColor: "bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300",
    accentColor: "text-blue-900",
    horizonElements: (
      <>
        <motion.div
          className="absolute bottom-[48%] left-1/2 -translate-x-1/2 w-40 h-1 bg-yellow-200/50 rounded-full blur-sm"
          animate={{ scaleX: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-px bg-white/20"
            style={{ bottom: `${20 + i * 5}%` }}
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </>
    ),
  },
  {
    name: "우유니 소금 사막",
    subtitle: "Salar de Uyuni",
    gradient: "from-slate-200 via-blue-100 to-cyan-100",
    groundGradient: "from-slate-100 via-blue-50 to-white",
    skyColor: "bg-gradient-to-b from-blue-200 via-cyan-100 to-slate-100",
    accentColor: "text-slate-800",
    horizonElements: (
      <>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-100/40 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-2 bg-white/30 rounded-full blur-md"
            style={{ left: `${20 + i * 25}%`, bottom: `${35 + i * 3}%` }}
            animate={{ x: [0, 15, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity }}
          />
        ))}
      </>
    ),
  },
  {
    name: "초원의 언덕",
    subtitle: "Green Hills",
    gradient: "from-green-200 via-emerald-300 to-green-400",
    groundGradient: "from-green-300 via-emerald-400 to-green-600",
    skyColor: "bg-gradient-to-b from-blue-100 via-sky-200 to-green-100",
    accentColor: "text-emerald-900",
    horizonElements: (
      <>
        <svg
          className="absolute bottom-[30%] left-0 w-full"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          style={{ height: "30%" }}
        >
          <path d="M0,150 Q200,50 400,120 Q600,30 800,100 Q1000,60 1200,130 L1200,200 L0,200 Z" fill="rgba(34,197,94,0.3)" />
          <path d="M0,170 Q300,80 500,140 Q700,70 900,130 Q1100,90 1200,160 L1200,200 L0,200 Z" fill="rgba(22,163,74,0.4)" />
        </svg>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-4 bg-green-600/40 origin-bottom"
            style={{ left: `${10 + i * 11}%`, bottom: "18%" }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          />
        ))}
      </>
    ),
  },
];

const FinaleScreen = ({ profile, onRestart }: FinaleScreenProps) => {
  const landscapeIndex = useMemo(() => getRecommendedLandscape(profile), [profile]);
  const landscape = landscapes[landscapeIndex];
  const finaleMsg = useMemo(() => getFinaleMessage(profile), [profile]);

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <div className={`absolute inset-0 ${landscape.skyColor}`} />

      <motion.div
        className="absolute top-[15%] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, delay: 0.5 }}
      >
        <div className="w-20 h-20 rounded-full bg-yellow-100 blur-xl opacity-60" />
        <div className="absolute inset-2 rounded-full bg-yellow-50 blur-md opacity-80" />
      </motion.div>

      {landscape.horizonElements}

      <div className={`absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-b ${landscape.groundGradient}`} />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          <p className="text-xs tracking-[0.5em] text-slate-600 mb-4">
            {landscape.subtitle}
          </p>
          <h1 className={`text-3xl md:text-5xl font-serif font-light ${landscape.accentColor} mb-3`}>
            {finaleMsg.title}
          </h1>
          <p className={`text-sm ${landscape.accentColor}/70 tracking-widest mb-2`}>
            {finaleMsg.subtitle}
          </p>
          <p className="text-xs text-slate-500 italic mt-4 max-w-xs mx-auto leading-relaxed">
            "{landscape.name}이 당신 앞에 펼쳐집니다.
            <br />
            당신의 마음도 이처럼 넓고 고요합니다."
          </p>
        </motion.div>

        <motion.button
          onClick={onRestart}
          className="mt-16 px-10 py-3 border border-slate-400/40 rounded-sm text-sm text-slate-600 tracking-widest font-serif hover:bg-white/30 transition-all duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          다시 하기
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FinaleScreen;
