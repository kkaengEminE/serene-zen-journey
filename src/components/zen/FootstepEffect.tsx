import { motion, AnimatePresence } from "framer-motion";

interface Footstep {
  id: number;
  x: number;
  y: number;
}

interface FootstepEffectProps {
  footsteps: Footstep[];
}

const FootstepEffect = ({ footsteps }: FootstepEffectProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {footsteps.map((step) => (
          <motion.div
            key={step.id}
            className="absolute"
            style={{ left: step.x, top: step.y, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0.7, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Outer ripple ring */}
            <div className="w-16 h-16 rounded-full border border-foreground/20" />
            {/* Inner ripple */}
            <motion.div
              className="absolute inset-2 rounded-full border border-foreground/15"
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            />
            {/* Center dot */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FootstepEffect;
