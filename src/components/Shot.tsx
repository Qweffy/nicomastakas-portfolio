/* eslint-disable @next/next/no-img-element -- SSG site, build-time-optimized committed WebP; next/image adds no value and matches the MDX <img> convention */
import type { ReactNode } from "react";

export interface ShotProps {
  src: string;
  alt: string;
  /** Unique id; powers the CSS-only `:target` lightbox. */
  id: string;
  caption?: ReactNode;
  /** Tall doc pages (design systems) are clipped to a tile; full image opens in the lightbox. */
  tall?: boolean;
}

/** Framed screenshot with a zero-JS, CSS `:target` lightbox. Server Component. */
export function Shot({ src, alt, id, caption, tall = false }: ShotProps) {
  return (
    <figure className="shot">
      <a href={`#${id}`} className="shot__thumb nm-focusable" aria-label={`Open ${alt}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={tall ? "shot__img shot__img--tall" : "shot__img"}
        />
      </a>
      {caption ? <figcaption className="shot__cap">{caption}</figcaption> : null}
      <a id={id} href="#_" className="shot__lightbox" aria-label="Close">
        <img src={src} alt="" loading="lazy" decoding="async" />
      </a>
    </figure>
  );
}
