import type React from 'react';

interface TintedDecoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Decoration image drawn as a flat silhouette in --color-deco (app/globals.css).
 * The hidden <img> keeps the natural size; the wrapper paints the color through
 * the image's alpha as a mask. Sizing classes go on the wrapper.
 */
export function TintedDeco({ src, className = '', style }: TintedDecoProps) {
  if (!src) return null;
  return (
    <span
      className={`tinted-deco ${className}`}
      aria-hidden="true"
      style={{ ...style, '--deco-src': `url("${src}")` } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="tinted-deco__img" loading="lazy" decoding="async" />
    </span>
  );
}
