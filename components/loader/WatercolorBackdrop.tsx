import React from 'react';
import './watercolor-backdrop.css';

type WatercolorBackdropProps = {
  /** Use fixed positioning (envelope hero covers the viewport). */
  fixed?: boolean;
  /** Washes only (no paper base), faded at the top/bottom — stacks over another backdrop per section. */
  layer?: boolean;
  /** Flip horizontally so the washes bleed from the opposite corners. */
  mirror?: boolean;
};

// [x %, y %, size px, twinkle delay s] — small four-point sparkles over the washes
const SPARKLES: [number, number, number, number][] = [
  [92, 11, 18, 0],
  [86, 19, 10, 1.4],
  [9, 79, 14, 0.7],
  [24, 86, 10, 2.1],
  [12, 92, 8, 3],
  [58, 6, 8, 2.6],
  [74, 64, 9, 1.9],
  [30, 30, 7, 3.6],
];

// Golden dust motes drifting slowly upward
const MOTES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 16 + ((i * 5) % 12),
  delay: -((i * 3.7) % 24),
  drift: (i % 2 === 0 ? 1 : -1) * (14 + ((i * 13) % 30)),
}));

/** Wet-on-paper wash: warm cream paper with soft beige watercolor clouds
 *  bleeding in from the corners, slowly breathing and drifting, with a
 *  travelling light, golden dust and a few sparkles. */
export function WatercolorBackdrop({ fixed = false, layer = false, mirror = false }: WatercolorBackdropProps) {
  return (
    <div
      className={`watercolor-backdrop${fixed ? ' watercolor-backdrop--fixed' : ''}${layer ? ' watercolor-backdrop--layer' : ''}${mirror ? ' watercolor-backdrop--mirror' : ''}`}
      aria-hidden="true"
    >
      <svg className="watercolor-backdrop__defs" width="0" height="0" focusable="false">
        <filter id="wc-bleed" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="70" />
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </svg>

      <div className="watercolor-backdrop__washes">
      <svg className="watercolor-backdrop__wash watercolor-backdrop__wash--top" viewBox="0 0 400 400" preserveAspectRatio="none">
        <g filter="url(#wc-bleed)">
          <ellipse cx="300" cy="70" rx="190" ry="120" className="wc-tone-1" />
          <ellipse cx="360" cy="190" rx="90" ry="140" className="wc-tone-2" />
          <ellipse cx="200" cy="30" rx="140" ry="60" className="wc-tone-3" />
        </g>
      </svg>

      <svg className="watercolor-backdrop__wash watercolor-backdrop__wash--bottom" viewBox="0 0 400 400" preserveAspectRatio="none">
        <g filter="url(#wc-bleed)">
          <ellipse cx="110" cy="320" rx="210" ry="120" className="wc-tone-1" />
          <ellipse cx="40" cy="220" rx="90" ry="130" className="wc-tone-2" />
          <ellipse cx="230" cy="370" rx="160" ry="70" className="wc-tone-3" />
          <ellipse cx="160" cy="200" rx="70" ry="40" className="wc-tone-3" />
        </g>
      </svg>

      {/* Faint wandering wash through the middle so the paper never feels static */}
      <svg className="watercolor-backdrop__wash watercolor-backdrop__wash--drift" viewBox="0 0 400 400" preserveAspectRatio="none">
        <g filter="url(#wc-bleed)">
          <ellipse cx="200" cy="200" rx="150" ry="90" className="wc-tone-3" />
          <ellipse cx="250" cy="230" rx="70" ry="50" className="wc-tone-1" />
        </g>
      </svg>

      </div>

      <div className="watercolor-backdrop__light" />
      {!layer && <div className="watercolor-backdrop__paper" />}

      <div className="watercolor-backdrop__motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="watercolor-backdrop__mote"
            style={
              {
                '--x': `${m.x}%`,
                '--size': `${m.size}px`,
                '--dur': `${m.dur}s`,
                '--delay': `${m.delay}s`,
                '--drift': `${m.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {SPARKLES.map(([x, y, size, delay], i) => (
        <svg
          key={i}
          className="watercolor-backdrop__sparkle"
          viewBox="0 0 24 24"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
            } as React.CSSProperties
          }
        >
          <path d="M12 0C12.8 7.5 16.5 11.2 24 12C16.5 12.8 12.8 16.5 12 24C11.2 16.5 7.5 12.8 0 12C7.5 11.2 11.2 7.5 12 0Z" />
        </svg>
      ))}
    </div>
  );
}
