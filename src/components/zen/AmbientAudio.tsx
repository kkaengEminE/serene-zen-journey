import { useEffect, useRef } from "react";

// Web Audio API based ambient sound generator
// Creates water drip (suikinkutsu) + wind ambient sounds procedurally

function createWhiteNoise(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.01;
  }
  return buffer;
}

function playWaterDrip(ctx: AudioContext, masterGain: GainNode) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Random pitch for variety
  const baseFreq = 800 + Math.random() * 1200;
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, ctx.currentTime + 0.8);
  osc.type = "sine";

  filter.type = "bandpass";
  filter.frequency.value = 1000;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(0.08 + Math.random() * 0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(ctx.currentTime + 0.8);
}

function startWindAmbience(ctx: AudioContext, masterGain: GainNode): AudioBufferSourceNode {
  const noise = createWhiteNoise(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.value = 0.3;

  // Subtle LFO on filter for breathing effect
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start();

  return source;
}

interface AmbientAudioProps {
  isPlaying: boolean;
  volume?: number; // 0-1
}

const AmbientAudio = ({ isPlaying, volume = 0.4 }: AmbientAudioProps) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const windSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const dripIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    ctxRef.current = ctx;
    masterGainRef.current = masterGain;

    // Fade in
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);

    // Start wind
    windSourceRef.current = startWindAmbience(ctx, masterGain);

    // Water drips at random intervals
    const scheduleDrip = () => {
      const delay = 2000 + Math.random() * 4000;
      dripIntervalRef.current = setTimeout(() => {
        if (ctx.state === "running") {
          playWaterDrip(ctx, masterGain);
        }
        scheduleDrip();
      }, delay);
    };
    scheduleDrip();

    return () => {
      if (dripIntervalRef.current) clearTimeout(dripIntervalRef.current);
      if (windSourceRef.current) {
        try { windSourceRef.current.stop(); } catch {}
      }
      if (masterGainRef.current && ctxRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
        setTimeout(() => ctx.close(), 600);
      } else {
        ctx.close();
      }
    };
  }, [isPlaying, volume]);

  // Update volume dynamically
  useEffect(() => {
    if (masterGainRef.current && ctxRef.current && ctxRef.current.state === "running") {
      masterGainRef.current.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + 0.3);
    }
  }, [volume]);

  return null;
};

export default AmbientAudio;
