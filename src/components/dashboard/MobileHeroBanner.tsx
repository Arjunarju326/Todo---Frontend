"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { useMobileAtmosphere } from "@/lib/mobileAtmosphere";

export const MOBILE_HERO_IMAGES = [
  "/images/hero-sunrise.jpg",
  "/images/hero-afternoon.jpg",
  "/images/hero-evening.jpg",
  "/images/hero-mist.jpg",
  "/images/hero-lake.jpg",
  "/images/hero-forest.jpg",
  "/images/hero-valley.jpg",
  "/images/hero-peaks.jpg",
  "/images/hero-meadow.jpg",
  "/images/hero-river.jpg",
  "/images/hero-coast.jpg",
  "/images/hero-hills.jpg",
] as const;

const ROTATE_MS = 2 * 60 * 1000;

type MobileHeroBannerProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  image?: string;
  actions?: ReactNode;
  tall?: boolean;
  className?: string;
  rotate?: boolean;
};

function pickInitialIndex() {
  return Math.floor(Math.random() * MOBILE_HERO_IMAGES.length);
}

/** Mobile-only scenic hero used across Dayflow screens (hidden from md+). */
export default function MobileHeroBanner({
  title,
  subtitle,
  image,
  actions,
  tall = false,
  className = "",
  rotate,
}: MobileHeroBannerProps) {
  const { enabled: atmosphereOn, currentImage } = useMobileAtmosphere();
  const shouldRotate = rotate ?? !image;
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!shouldRotate || atmosphereOn) return;
    setIndex(pickInitialIndex());
    setReady(true);
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MOBILE_HERO_IMAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [shouldRotate, atmosphereOn]);

  useEffect(() => {
    if (!shouldRotate || !ready || atmosphereOn) return;
    const next = MOBILE_HERO_IMAGES[(index + 1) % MOBILE_HERO_IMAGES.length];
    const img = new window.Image();
    img.src = next;
  }, [index, shouldRotate, ready, atmosphereOn]);

  // When full-screen atmosphere is on, mirror that image in the hero for cohesion
  const src = atmosphereOn
    ? currentImage
    : shouldRotate
      ? MOBILE_HERO_IMAGES[index] || MOBILE_HERO_IMAGES[0]
      : image || MOBILE_HERO_IMAGES[0];

  return (
    <section
      className={`md:hidden relative overflow-hidden rounded-[20px] border border-[var(--card-border)] shadow-xs df-mobile-hero ${
        tall ? "min-h-[148px]" : "min-h-[112px]"
      } ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-[1.02] animate-df-fade-in transition-opacity duration-700"
      />
      <div className="df-mobile-hero-scrim absolute inset-0 bg-gradient-to-r from-[#f6f5ee]/95 via-[#f6f5ee]/78 to-[#f6f5ee]/28" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/55 via-transparent to-transparent" />
      <div
        className={`relative z-10 flex items-end justify-between gap-3 ${
          tall ? "px-4 py-5 min-h-[148px]" : "px-4 py-4 min-h-[112px]"
        }`}
      >
        <div className="min-w-0">
          <h1 className="font-display text-[24px] sm:text-[26px] font-bold text-[var(--sidebar-end)] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-[12px] text-[var(--foreground-muted)] mt-1 font-medium">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
