import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';

export default function MountainBackground() {
  const [scrollY, setScrollY] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        x: ((i * 31 + 7) % 100),
        y: ((i * 17 + 3) % 45),
        size: 0.5 + ((i * 13) % 3) * 0.5,
        delay: ((i * 7) % 40) / 10,
        duration: 2 + ((i * 11) % 30) / 10,
      })),
    []
  );

  const d = isDark ? 'd' : 'l';

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-gradient-to-b from-[#070b14] via-[#0c1524] to-[#0a0f1e]'
            : 'bg-gradient-to-b from-[#1a1a3e] via-[#c4785e] via-[60%] to-[#f0d5a0]'
        }`}
      />

      {/* Light mode: golden hour sun glow */}
      {!isDark && (
        <>
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              bottom: '25%',
              left: '50%',
              transform: `translate(-50%, ${scrollY * 0.08}px)`,
              background: 'radial-gradient(circle, rgba(255,200,80,0.5) 0%, rgba(255,160,50,0.2) 30%, transparent 65%)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-20 motion-reduce:hidden"
            style={{
              background: `
                linear-gradient(175deg, transparent 40%, rgba(255,200,80,0.15) 42%, transparent 44%),
                linear-gradient(168deg, transparent 38%, rgba(255,180,60,0.1) 40%, transparent 42%),
                linear-gradient(182deg, transparent 42%, rgba(255,200,80,0.12) 44%, transparent 46%),
                linear-gradient(172deg, transparent 36%, rgba(255,220,100,0.08) 38%, transparent 40%)
              `,
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Dark mode: Stars */}
      {isDark && (
        <div className="absolute inset-0" aria-hidden="true">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white star-twinkle motion-reduce:animate-none"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Dark mode: Shooting stars */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
          <div className="shooting-star" />
          <div className="shooting-star shooting-star-2" />
          <div className="shooting-star shooting-star-3" />
          <div className="shooting-star shooting-star-4" />
        </div>
      )}

      {/* Dark mode: Aurora borealis */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
          <div
            className="aurora-ribbon aurora-1"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          />
          <div
            className="aurora-ribbon aurora-2"
            style={{ transform: `translateY(${scrollY * 0.03}px)` }}
          />
          <div
            className="aurora-ribbon aurora-3"
            style={{ transform: `translateY(${scrollY * 0.04}px)` }}
          />
        </div>
      )}

      {/* Drifting clouds */}
      <div className="absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
        <div
          className="cloud-drift"
          style={{
            top: isDark ? '20%' : '15%',
            opacity: isDark ? 0.04 : 0.3,
          }}
        />
        <div
          className="cloud-drift cloud-drift-2"
          style={{
            top: isDark ? '35%' : '25%',
            opacity: isDark ? 0.03 : 0.2,
          }}
        />
      </div>

      {/* SVG Mountains — 6 layers with bezier curves */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMax slice"
        style={{ minHeight: '100%' }}
      >
        <defs>
          {/* Snow gradients */}
          <linearGradient id="snow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#dde4ed" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="snow-faint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>

          {/* Dark mode — 6 layer gradients, far→near */}
          <linearGradient id="m1d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1c2848" />
            <stop offset="100%" stopColor="#111d36" />
          </linearGradient>
          <linearGradient id="m1d-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#151f3a" />
            <stop offset="100%" stopColor="#0d1628" />
          </linearGradient>
          <linearGradient id="m2d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#243454" />
            <stop offset="100%" stopColor="#182640" />
          </linearGradient>
          <linearGradient id="m2d-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2844" />
            <stop offset="100%" stopColor="#101c32" />
          </linearGradient>
          <linearGradient id="m3d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2540" />
            <stop offset="100%" stopColor="#0f1a2e" />
          </linearGradient>
          <linearGradient id="m4d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#141e34" />
            <stop offset="100%" stopColor="#0c1422" />
          </linearGradient>
          <linearGradient id="m5d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f1825" />
            <stop offset="100%" stopColor="#0a0f1e" />
          </linearGradient>
          <linearGradient id="m6d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b1018" />
            <stop offset="100%" stopColor="#0a0f1e" />
          </linearGradient>

          {/* Light mode — golden hour warm tones, atmospheric perspective */}
          <linearGradient id="m1l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a6888" />
            <stop offset="100%" stopColor="#5a4a6a" />
          </linearGradient>
          <linearGradient id="m1l-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a4a6a" />
            <stop offset="100%" stopColor="#4a3a58" />
          </linearGradient>
          <linearGradient id="m2l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6a5a70" />
            <stop offset="100%" stopColor="#5a4a60" />
          </linearGradient>
          <linearGradient id="m2l-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#554560" />
            <stop offset="100%" stopColor="#4a3a55" />
          </linearGradient>
          <linearGradient id="m3l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a6058" />
            <stop offset="100%" stopColor="#4a5048" />
          </linearGradient>
          <linearGradient id="m4l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5a48" />
            <stop offset="100%" stopColor="#3a4a38" />
          </linearGradient>
          <linearGradient id="m5l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#344832" />
            <stop offset="100%" stopColor="#263826" />
          </linearGradient>
          <linearGradient id="m6l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e301c" />
            <stop offset="100%" stopColor="#1a2a18" />
          </linearGradient>

          {/* Atmospheric haze gradients */}
          <linearGradient id="haze1-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#111d36" stopOpacity="0" />
            <stop offset="100%" stopColor="#111d36" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="haze2-d" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f1a2e" stopOpacity="0" />
            <stop offset="100%" stopColor="#0f1a2e" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="haze1-l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c4785e" stopOpacity="0" />
            <stop offset="100%" stopColor="#c4785e" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="haze2-l" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a0886a" stopOpacity="0" />
            <stop offset="100%" stopColor="#a0886a" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* ===== Layer 1: Distant peaks — faded, smooth, atmospheric ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.02}px)` }}>
          <path
            d={`M0,700 L0,340
              Q60,335 100,320 Q140,305 180,310
              Q210,315 240,280 Q260,258 290,250
              Q310,244 340,200 Q358,178 380,168
              C400,155 415,145 430,130
              Q445,118 460,125 Q480,135 500,148
              Q520,158 540,140 Q555,128 570,115
              C585,103 600,92 620,82
              Q640,72 660,80 Q685,92 700,108
              Q720,126 740,135 Q770,148 790,138
              Q810,128 835,105 Q850,92 870,85
              Q890,78 910,95 Q935,115 950,130
              Q975,152 1000,148 Q1030,142 1050,128
              Q1075,112 1100,105 Q1120,100 1140,115
              Q1165,135 1190,155 Q1210,168 1240,178
              Q1270,188 1300,210 Q1330,228 1360,245
              Q1400,268 1440,260 L1440,700 Z`}
            fill={`url(#m1${d})`}
          />
          {/* Shadow face on major peaks — steeper right sides */}
          <path
            d={`M430,130 Q445,118 460,125 Q480,135 500,148 L500,200 Q470,185 445,170 Q435,158 430,130 Z`}
            fill={`url(#m1${d}-shadow)`}
            opacity="0.6"
          />
          <path
            d={`M620,82 Q640,72 660,80 Q685,92 700,108 L700,160 Q680,140 660,125 Q640,108 620,82 Z`}
            fill={`url(#m1${d}-shadow)`}
            opacity="0.6"
          />
          {/* Snow caps — organic contour shapes */}
          <path
            d="M380,168 C395,158 412,148 430,130 Q445,118 460,125 Q472,130 480,138 L470,145 Q455,135 445,138 Q430,148 415,158 Q400,165 380,168 Z"
            fill="url(#snow)"
          />
          <path
            d="M570,115 C582,105 598,94 620,82 Q640,72 660,80 Q675,88 685,98 L672,105 Q658,92 648,90 Q635,90 620,100 Q600,112 585,118 Z"
            fill="url(#snow)"
          />
          <path
            d="M835,105 Q850,92 870,85 Q890,78 910,95 Q920,105 925,112 L912,108 Q900,96 888,92 Q875,90 860,98 Q848,106 835,105 Z"
            fill="url(#snow-faint)"
          />
        </g>

        {/* Haze layer 1 */}
        <rect
          x="0" y="280" width="1440" height="420"
          fill={`url(#haze1-${d})`}
          opacity="0.4"
          style={{ transform: `translateY(${scrollY * 0.025}px)` }}
        />

        {/* ===== Layer 2: Mid-distance peaks — moderate detail ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
          <path
            d={`M0,700 L0,400
              Q40,395 80,385 Q120,375 150,380
              Q180,385 220,350 Q245,330 270,305
              C290,285 305,268 330,250
              Q350,238 370,248 Q400,262 430,278
              Q460,295 490,285 Q510,278 530,260
              C550,242 565,228 585,218
              Q605,208 625,215 Q650,225 670,242
              Q700,265 730,278 Q765,292 800,282
              Q825,275 850,255 Q870,240 895,228
              C915,218 930,215 950,225
              Q975,240 995,258 Q1020,278 1050,288
              Q1080,298 1110,290 Q1135,282 1160,265
              Q1185,248 1210,240 Q1240,232 1260,248
              Q1290,268 1320,298 Q1360,332 1400,345
              Q1420,352 1440,348 L1440,700 Z`}
            fill={`url(#m2${d})`}
          />
          {/* Shadow faces */}
          <path
            d={`M330,250 Q350,238 370,248 Q400,262 430,278 L430,340 Q400,318 375,300 Q355,280 330,250 Z`}
            fill={`url(#m2${d}-shadow)`}
            opacity="0.5"
          />
          <path
            d={`M585,218 Q605,208 625,215 Q650,225 670,242 L670,310 Q645,285 625,268 Q605,248 585,218 Z`}
            fill={`url(#m2${d}-shadow)`}
            opacity="0.5"
          />
          {/* Snow touches */}
          <path
            d="M305,268 C315,258 325,252 330,250 Q350,238 370,248 Q380,254 385,260 L375,258 Q360,248 348,250 Q335,255 322,265 Z"
            fill="url(#snow-faint)"
          />
          <path
            d="M565,228 C575,222 580,220 585,218 Q605,208 625,215 Q635,218 640,224 L630,222 Q618,215 608,216 Q595,220 580,228 Z"
            fill="url(#snow-faint)"
          />
        </g>

        {/* Haze layer 2 */}
        <rect
          x="0" y="350" width="1440" height="350"
          fill={`url(#haze2-${d})`}
          opacity="0.3"
          style={{ transform: `translateY(${scrollY * 0.06}px)` }}
        />

        {/* ===== Layer 3: Closer ridges — rolling, less jagged ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.09}px)` }}>
          <path
            d={`M0,700 L0,460
              Q60,450 120,440 Q180,432 240,440
              Q300,448 340,420 Q370,402 400,388
              C430,374 455,368 480,375
              Q510,384 540,398 Q580,415 620,408
              Q650,402 680,385 Q710,368 740,358
              C770,348 795,348 820,360
              Q850,374 880,392 Q920,412 960,405
              Q990,398 1020,378 Q1050,360 1080,350
              Q1110,342 1140,355 Q1175,372 1210,392
              Q1260,418 1310,425 Q1370,432 1440,420
              L1440,700 Z`}
            fill={`url(#m3${d})`}
          />
        </g>

        {/* ===== Layer 4: Foothills — gentle rolling terrain ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.13}px)` }}>
          <path
            d={`M0,700 L0,500
              Q80,492 160,488 Q240,485 320,492
              Q380,498 440,480 Q490,468 540,465
              C580,462 610,465 650,475
              Q700,488 760,492 Q820,495 880,485
              Q930,478 980,468 Q1020,462 1060,465
              C1100,468 1130,475 1170,485
              Q1220,498 1280,502 Q1350,505 1440,495
              L1440,700 Z`}
            fill={`url(#m4${d})`}
          />
        </g>

        {/* ===== Layer 5: Dense treeline ridge ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.16}px)` }}>
          <path
            d={`M0,700 L0,530
              Q50,526 100,522 Q150,518 200,524
              Q260,530 320,518 Q370,510 420,508
              C460,506 490,510 530,516
              Q580,524 640,520 Q700,516 760,510
              Q810,506 860,510 Q910,514 960,508
              Q1010,502 1060,505 Q1110,508 1160,512
              Q1220,518 1280,514 Q1350,510 1440,515
              L1440,700 Z`}
            fill={`url(#m5${d})`}
          />
          {/* Tree silhouettes — varied sizes, natural clumping with gaps */}
          {[
            // Clump 1 — left edge
            { x: 35, h: 38, w: 9 }, { x: 55, h: 48, w: 11 }, { x: 72, h: 42, w: 10 }, { x: 85, h: 32, w: 8 },
            // Gap, then clump 2
            { x: 140, h: 52, w: 12 }, { x: 160, h: 44, w: 10 }, { x: 178, h: 56, w: 13 }, { x: 195, h: 40, w: 9 }, { x: 210, h: 35, w: 8 },
            // Sparse singles
            { x: 270, h: 46, w: 10 }, { x: 300, h: 38, w: 9 },
            // Clump 3 — dense
            { x: 360, h: 50, w: 11 }, { x: 378, h: 58, w: 13 }, { x: 395, h: 44, w: 10 }, { x: 412, h: 52, w: 12 }, { x: 428, h: 36, w: 8 },
            // Gap
            { x: 490, h: 42, w: 10 }, { x: 510, h: 54, w: 12 },
            // Clump 4
            { x: 570, h: 48, w: 11 }, { x: 590, h: 56, w: 13 }, { x: 608, h: 40, w: 9 }, { x: 625, h: 50, w: 11 },
            // Sparse
            { x: 690, h: 44, w: 10 },
            // Clump 5
            { x: 740, h: 52, w: 12 }, { x: 758, h: 46, w: 10 }, { x: 775, h: 58, w: 13 }, { x: 795, h: 42, w: 9 },
            // Singles
            { x: 850, h: 38, w: 9 }, { x: 880, h: 50, w: 11 },
            // Clump 6
            { x: 940, h: 54, w: 12 }, { x: 960, h: 46, w: 10 }, { x: 975, h: 52, w: 11 }, { x: 992, h: 38, w: 9 },
            // Gap, then clump 7
            { x: 1060, h: 48, w: 11 }, { x: 1080, h: 56, w: 13 }, { x: 1098, h: 44, w: 10 },
            // Sparse
            { x: 1160, h: 42, w: 10 }, { x: 1190, h: 50, w: 11 },
            // Clump 8 — right
            { x: 1250, h: 54, w: 12 }, { x: 1270, h: 46, w: 10 }, { x: 1290, h: 58, w: 14 }, { x: 1310, h: 40, w: 9 },
            // Trailing
            { x: 1370, h: 44, w: 10 }, { x: 1400, h: 36, w: 8 }, { x: 1425, h: 48, w: 11 },
          ].map((tree, i) => {
            const baseY = 528 - Math.sin(tree.x * 0.008) * 12;
            const { x, h, w } = tree;
            return (
              <path
                key={i}
                d={`M${x},${baseY}
                  L${x - w},${baseY}
                  L${x - w * 0.55},${baseY - h * 0.3}
                  L${x - w * 0.75},${baseY - h * 0.32}
                  L${x - w * 0.35},${baseY - h * 0.58}
                  L${x - w * 0.5},${baseY - h * 0.6}
                  L${x - w * 0.18},${baseY - h * 0.82}
                  L${x - w * 0.3},${baseY - h * 0.83}
                  L${x},${baseY - h}
                  L${x + w * 0.3},${baseY - h * 0.83}
                  L${x + w * 0.18},${baseY - h * 0.82}
                  L${x + w * 0.5},${baseY - h * 0.6}
                  L${x + w * 0.35},${baseY - h * 0.58}
                  L${x + w * 0.75},${baseY - h * 0.32}
                  L${x + w * 0.55},${baseY - h * 0.3}
                  L${x + w},${baseY} Z`}
                fill={isDark ? '#0a0f1e' : '#152414'}
              />
            );
          })}
        </g>

        {/* ===== Layer 6: Foreground ground plane ===== */}
        <g style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <path
            d={`M0,700 L0,565
              Q80,558 160,555 Q240,553 320,558
              Q400,562 480,555 Q560,550 640,553
              Q720,556 800,552 Q880,548 960,552
              Q1040,555 1120,550 Q1200,548 1280,552
              Q1360,555 1440,550
              L1440,700 Z`}
            fill={`url(#m6${d})`}
          />
        </g>
      </svg>

      {/* Bottom mist / fog */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44"
        style={{
          background: isDark
            ? 'linear-gradient(to top, rgb(10,15,30) 0%, rgba(10,15,30,0.85) 35%, rgba(10,15,30,0.3) 70%, transparent 100%)'
            : 'linear-gradient(to top, rgb(248,250,252) 0%, rgba(248,250,252,0.7) 35%, rgba(248,250,252,0.2) 70%, transparent 100%)',
          transform: `translateY(${scrollY * 0.25}px)`,
        }}
        aria-hidden="true"
      />

      {/* Subtle valley mist wisps */}
      <div
        className="absolute bottom-32 left-[15%] w-[400px] h-16 rounded-full filter blur-2xl"
        style={{
          background: isDark ? 'rgba(15,26,46,0.5)' : 'rgba(248,250,252,0.3)',
          transform: `translateY(${scrollY * 0.12}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-28 right-[20%] w-[300px] h-12 rounded-full filter blur-2xl"
        style={{
          background: isDark ? 'rgba(15,26,46,0.4)' : 'rgba(248,250,252,0.25)',
          transform: `translateY(${scrollY * 0.14}px)`,
        }}
        aria-hidden="true"
      />

      {/* Accent glow along treeline */}
      <div
        className="absolute bottom-24 left-1/3 w-[500px] h-20 rounded-full filter blur-3xl"
        style={{
          background: isDark ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 180, 60, 0.1)',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
