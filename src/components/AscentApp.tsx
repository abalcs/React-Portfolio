import React, { Suspense, useEffect, useState } from 'react';
import { HiEye, HiEyeOff, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { FaCar, FaHiking } from 'react-icons/fa';
import Layout from './Layout/Layout';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { suvTelemetry } from '../lib/vehicleBus';
import Hero from './Hero/Hero';
import LoadingScreen from './UI/LoadingScreen';
import BackToTop from './UI/BackToTop';
import WaypointPanel from './WaypointPanel';
import type { SectionId } from '../three/journey';
import { WAYPOINT_T } from '../three/journey';

// The only code-split boundary in the app: the entire three.js graph
// (three/fiber/drei/postprocessing) loads behind this lazy import so the
// 2D fallback path never pays for it.
const LazyAscentScene = React.lazy(() => import('../three/AscentScene'));

// How many viewport-heights of scroll the full climb takes.
const JOURNEY_VH = 700;

/** Hero intro that fades as the hiker sets off — or the SUV drives away. */
function HeroOverlay() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const compute = () => {
      const scrollFade = Math.max(
        0,
        1 - window.scrollY / (window.innerHeight * 0.55)
      );
      const driveFade = suvTelemetry.driving
        ? Math.max(0, 1 - Math.max(0, suvTelemetry.distFromSpawn - 12) / 22)
        : 1;
      const next = Math.min(scrollFade, driveFade);
      setOpacity((prev) => (Math.abs(prev - next) > 0.02 ? next : prev));
    };
    window.addEventListener('scroll', compute, { passive: true });
    // the SUV moves without scrolling — poll its telemetry
    const poll = window.setInterval(compute, 140);
    return () => {
      window.removeEventListener('scroll', compute);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
      style={{
        opacity,
        visibility: opacity < 0.02 ? 'hidden' : 'visible',
      }}
    >
      <Hero variant="ascent" />
    </div>
  );
}

/**
 * The Ascent — a pure 3D experience. The document scroll is only a
 * "journey driver": a tall spacer whose anchors keep Header nav,
 * ScrollProgress, and BackToTop working while the scene renders the site.
 */
export default function AscentApp() {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);
  const [freeLook, setFreeLook] = useState(false);
  const [driving, setDriving] = useState(false);
  const { enabled: soundOn, toggle: toggleSound } = useAmbientAudio();

  // driving needs a keyboard — hide the option on touch-only devices
  const hasKeyboard = React.useMemo(() => {
    try {
      return !window.matchMedia('(pointer: coarse)').matches;
    } catch {
      return true;
    }
  }, []);

  return (
    <Layout transparent>
      <LoadingScreen />
      <Suspense fallback={null}>
        <LazyAscentScene
          onSelect={setOpenSection}
          paused={openSection !== null}
          freeLook={freeLook}
          driving={driving}
        />
      </Suspense>
      <HeroOverlay />
      {/* world controls */}
      <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-2.5">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-300 ${
            soundOn
              ? 'border-accent bg-accent/90 text-white'
              : 'border-white/20 bg-primary/60 text-text-primary hover:border-accent/60'
          }`}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Mute ambient sound' : 'Play ambient sound'}
        >
          {soundOn ? <HiVolumeUp size={18} /> : <HiVolumeOff size={18} />}
          {soundOn ? 'Sound On' : 'Sound Off'}
        </button>
        <button
          onClick={() => {
            setFreeLook((v) => !v);
            setDriving(false);
          }}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-300 ${
            freeLook
              ? 'border-accent bg-accent/90 text-white'
              : 'border-white/20 bg-primary/60 text-text-primary hover:border-accent/60'
          }`}
          aria-pressed={freeLook}
        >
          {freeLook ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          {freeLook ? 'Resume Follow' : 'Look Around'}
        </button>
        {hasKeyboard && (
          <button
            onClick={() => {
              setDriving((v) => !v);
              setFreeLook(false);
            }}
            className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-300 ${
              driving
                ? 'border-accent bg-accent/90 text-white'
                : 'border-white/20 bg-primary/60 text-text-primary hover:border-accent/60'
            }`}
            aria-pressed={driving}
          >
            {driving ? <FaHiking size={16} /> : <FaCar size={16} />}
            {driving ? 'Back to the Trail' : 'Take the SUV'}
          </button>
        )}
      </div>
      {/* driving controls hint */}
      {driving && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-primary/70 px-5 py-2 text-sm font-medium text-text-primary backdrop-blur-md">
          <span className="font-bold text-accent">W A S D</span> or arrows to
          drive · <span className="font-bold text-accent">SPACE</span> to brake
        </div>
      )}
      {/* scroll driver — invisible; anchors let #hash nav jump the journey */}
      <main
        className="relative z-10 pointer-events-none"
        style={{ height: `${JOURNEY_VH}vh` }}
      >
        <div id="home" className="absolute top-0 w-px h-px" />
        {(Object.keys(WAYPOINT_T) as Array<keyof typeof WAYPOINT_T>)
          .filter((id) => id !== 'home')
          .map((id) => (
            <div
              key={id}
              id={id}
              className="absolute w-px h-px"
              style={{ top: `calc(${WAYPOINT_T[id]} * (100% - 100vh))` }}
            />
          ))}
      </main>
      <WaypointPanel
        section={openSection}
        onClose={() => setOpenSection(null)}
      />
      <BackToTop />
    </Layout>
  );
}
