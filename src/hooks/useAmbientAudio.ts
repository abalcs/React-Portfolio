import { useCallback, useEffect, useRef, useState } from 'react';
import { onStep } from '../lib/stepBus';

/**
 * Procedural outdoor ambience (zero audio assets): a soft bed of filtered
 * wind with a slow swell, sparse stereo-panned bird chirps, and dirt
 * footstep crunches synced to the hiker's actual foot plants.
 *
 * Defaults ON — but browsers require a user gesture before audio can run,
 * so the context arms itself and starts on the first click/tap/keypress.
 */
export function useAmbientAudio() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timersRef = useRef<number[]>([]);
  const cleanupsRef = useRef<Array<() => void>>([]);

  const stop = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    cleanupsRef.current.forEach((fn) => fn());
    cleanupsRef.current = [];
    const ctx = ctxRef.current;
    ctxRef.current = null;
    masterRef.current = null;
    if (ctx) {
      window.setTimeout(() => {
        ctx.close().catch(() => {});
      }, 100);
    }
  }, []);

  const start = useCallback(() => {
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    ctxRef.current = ctx;

    // Autoplay policy: audio can only start after a user gesture. Try
    // immediately (Chrome resolves the pending promise on first
    // activation), and retry on EVERY plausible interaction — captured
    // phase so canvas handlers can't swallow them.
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
      const gestures: Array<keyof WindowEventMap> = [
        'pointerdown',
        'pointerup',
        'click',
        'keydown',
        'touchstart',
        'touchend',
        'wheel',
      ];
      const tryResume = () => {
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      };
      gestures.forEach((g) =>
        window.addEventListener(g, tryResume, { passive: true, capture: true })
      );
      const off = () =>
        gestures.forEach((g) =>
          window.removeEventListener(g, tryResume, { capture: true })
        );
      const onRunning = () => {
        if (ctx.state === 'running') {
          // re-anchor the fade-in so it plays out audibly from now
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(0, ctx.currentTime);
          master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
          off();
        }
      };
      ctx.addEventListener('statechange', onRunning);
      cleanupsRef.current.push(off);
    }

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    masterRef.current = master;

    /* ---- wind: looped pink-ish noise -> lowpass, slow gain swell ---- */
    const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const windData = windBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < windData.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      windData[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = windBuffer;
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 420;
    lowpass.Q.value = 0.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.13;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.05;
    lfo.connect(lfoDepth);
    lfoDepth.connect(windGain.gain);
    noise.connect(lowpass);
    lowpass.connect(windGain);
    windGain.connect(master);
    noise.start();
    lfo.start();

    /* ---- shared crunchy noise buffer for footsteps ---- */
    const stepBuffer = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * 0.1),
      ctx.sampleRate
    );
    const stepData = stepBuffer.getChannelData(0);
    for (let i = 0; i < stepData.length; i++) {
      stepData[i] = Math.random() * 2 - 1;
    }

    const pannedOut = (pan: number): AudioNode => {
      if (typeof ctx.createStereoPanner === 'function') {
        const p = ctx.createStereoPanner();
        p.pan.value = pan;
        p.connect(master);
        return p;
      }
      return master;
    };

    /* ---- birds: pitch-swept micro-chirps in short random phrases ---- */
    const chirp = (time: number, freq: number, pan: number, loud: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(
        freq * (1.12 + Math.random() * 0.3),
        time + 0.05
      );
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, time + 0.11);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(loud, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      osc.connect(gain);
      gain.connect(pannedOut(pan));
      osc.start(time);
      osc.stop(time + 0.2);
    };

    const phrase = () => {
      if (ctxRef.current !== ctx) return;
      // while suspended, currentTime is frozen — don't pile up phrases
      if (ctx.state === 'running') {
        const t0 = ctx.currentTime + 0.05;
        const base = 2100 + Math.random() * 1700;
        const pan = (Math.random() * 2 - 1) * 0.8;
        const distant = Math.random() < 0.35;
        const loud = distant ? 0.05 : 0.11 + Math.random() * 0.05;
        const notes = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < notes; i++) {
          chirp(
            t0 + i * (0.11 + Math.random() * 0.09),
            base * (0.95 + Math.random() * 0.12),
            pan,
            loud
          );
        }
      }
      timersRef.current.push(
        window.setTimeout(phrase, 2500 + Math.random() * 6500)
      );
    };
    timersRef.current.push(window.setTimeout(phrase, 900));

    /* ---- footsteps: crunch per foot plant from the hiker ---- */
    const unsubscribe = onStep((strength, foot) => {
      if (ctxRef.current !== ctx || ctx.state !== 'running') return;
      const time = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = stepBuffer;
      src.playbackRate.value = 0.85 + Math.random() * 0.35;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 480 + Math.random() * 320;
      band.Q.value = 0.9;
      const gain = ctx.createGain();
      const loud = 0.05 + 0.07 * strength;
      gain.gain.setValueAtTime(loud, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
      src.connect(band);
      band.connect(gain);
      gain.connect(pannedOut(foot === 0 ? -0.12 : 0.12));
      src.start(time);
      src.stop(time + 0.1);
    });
    cleanupsRef.current.push(unsubscribe);
  }, []);

  useEffect(() => {
    if (enabled) start();
    else stop();
    return stop;
  }, [enabled, start, stop]);

  return { enabled, toggle: () => setEnabled((v) => !v) };
}
