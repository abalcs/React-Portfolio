import React, { Suspense, useEffect, useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import Layout from './Layout/Layout';
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

/** Hero intro that fades away as the hiker sets off. */
function HeroOverlay() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const next = Math.max(
        0,
        1 - window.scrollY / (window.innerHeight * 0.55)
      );
      setOpacity((prev) => (Math.abs(prev - next) > 0.02 ? next : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  return (
    <Layout transparent>
      <LoadingScreen />
      <Suspense fallback={null}>
        <LazyAscentScene
          onSelect={setOpenSection}
          paused={openSection !== null}
          freeLook={freeLook}
        />
      </Suspense>
      <HeroOverlay />
      {/* free-look toggle */}
      <button
        onClick={() => setFreeLook((v) => !v)}
        className={`fixed bottom-6 left-6 z-30 flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-all duration-300 ${
          freeLook
            ? 'border-accent bg-accent/90 text-white'
            : 'border-white/20 bg-primary/60 text-text-primary hover:border-accent/60'
        }`}
        aria-pressed={freeLook}
      >
        {freeLook ? <HiEyeOff size={18} /> : <HiEye size={18} />}
        {freeLook ? 'Resume Follow' : 'Look Around'}
      </button>
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
