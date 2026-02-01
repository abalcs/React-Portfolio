import React, { useEffect, useState } from 'react';

export default function MountainBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f172a]" />

      {/* Stars */}
      <div className="absolute inset-0 opacity-60">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Aurora effect */}
      <div
        className="absolute top-0 left-0 right-0 h-64 opacity-20"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)',
          filter: 'blur(40px)',
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />

      {/* SVG Mountains */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="xMidYMax slice"
        style={{ minHeight: '100%' }}
      >
        <defs>
          {/* Snow gradient */}
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#e2e8f0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>

          {/* Mountain gradients */}
          <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="mountain3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="mountain4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Background mountains (furthest) - Torres del Paine inspired */}
        <g style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
          <path
            d="M0,600 L0,350 L100,280 L200,320 L280,180 L320,200 L400,120 L480,180 L520,160 L600,220 L680,140 L720,160 L800,100 L880,150 L960,180 L1040,120 L1120,200 L1200,150 L1280,220 L1360,180 L1440,250 L1440,600 Z"
            fill="url(#mountain1)"
          />
          {/* Snow caps */}
          <path
            d="M280,180 L320,200 L400,120 L480,180 L400,160 Z"
            fill="url(#snowGradient)"
          />
          <path
            d="M680,140 L720,160 L800,100 L880,150 L800,130 Z"
            fill="url(#snowGradient)"
          />
          <path
            d="M1040,120 L1120,200 L1200,150 L1120,140 Z"
            fill="url(#snowGradient)"
          />
        </g>

        {/* Mid-ground mountains */}
        <g style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <path
            d="M0,600 L0,400 L150,350 L250,380 L350,280 L450,340 L550,260 L650,320 L750,240 L850,300 L950,220 L1050,280 L1150,200 L1250,260 L1350,220 L1440,280 L1440,600 Z"
            fill="url(#mountain2)"
          />
          {/* Snow accents */}
          <path
            d="M550,260 L650,320 L750,240 L650,280 Z"
            fill="url(#snowGradient)"
            opacity="0.7"
          />
          <path
            d="M1150,200 L1250,260 L1350,220 L1250,220 Z"
            fill="url(#snowGradient)"
            opacity="0.7"
          />
        </g>

        {/* Near mountains */}
        <g style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <path
            d="M0,600 L0,450 L100,420 L200,380 L300,420 L400,350 L500,400 L600,340 L700,380 L800,320 L900,360 L1000,300 L1100,350 L1200,290 L1300,340 L1400,310 L1440,340 L1440,600 Z"
            fill="url(#mountain3)"
          />
        </g>

        {/* Foreground hills */}
        <g style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
          <path
            d="M0,600 L0,500 L200,480 L400,450 L600,470 L800,440 L1000,460 L1200,430 L1440,450 L1440,600 Z"
            fill="url(#mountain4)"
          />
        </g>

        {/* Ground/forest silhouette */}
        <path
          d="M0,600 L0,540 L50,535 L100,545 L150,530 L200,540 L250,525 L300,538 L350,520 L400,535 L450,518 L500,530 L550,515 L600,528 L650,512 L700,525 L750,510 L800,522 L850,508 L900,520 L950,505 L1000,518 L1050,502 L1100,515 L1150,500 L1200,512 L1250,498 L1300,510 L1350,495 L1400,508 L1440,500 L1440,600 Z"
          fill="#0f172a"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        />
      </svg>

      {/* Fog/mist effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary via-primary/80 to-transparent"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Subtle green accent glow */}
      <div
        className="absolute bottom-20 left-1/4 w-96 h-32 bg-accent/5 rounded-full filter blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      <div
        className="absolute bottom-32 right-1/4 w-64 h-24 bg-accent/5 rounded-full filter blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />
    </div>
  );
}
