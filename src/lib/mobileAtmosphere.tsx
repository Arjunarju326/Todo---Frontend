"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const MOBILE_BG_IMAGES = [
  "/images/mobile-bg/bg-01-sakura.jpg",
  "/images/mobile-bg/bg-02-bamboo.jpg",
  "/images/mobile-bg/bg-03-lavender.jpg",
  "/images/mobile-bg/bg-04-aurora.jpg",
  "/images/mobile-bg/bg-05-dunes.jpg",
  "/images/mobile-bg/bg-06-lagoon.jpg",
  "/images/mobile-bg/bg-07-autumn.jpg",
  "/images/mobile-bg/bg-08-winter.jpg",
  "/images/mobile-bg/bg-09-terraces.jpg",
  "/images/mobile-bg/bg-10-waterfall.jpg",
  "/images/mobile-bg/bg-11-cliffs.jpg",
  "/images/mobile-bg/bg-12-sunflowers.jpg",
  "/images/mobile-bg/bg-13-cabin.jpg",
  "/images/mobile-bg/bg-14-canyon.jpg",
  "/images/mobile-bg/bg-15-highlands.jpg",
  "/images/mobile-bg/bg-16-canopy.jpg",
  "/images/mobile-bg/hero-sunrise.jpg",
  "/images/mobile-bg/hero-afternoon.jpg",
  "/images/mobile-bg/hero-evening.jpg",
  "/images/mobile-bg/hero-mist.jpg",
  "/images/mobile-bg/hero-lake.jpg",
  "/images/mobile-bg/hero-forest.jpg",
  "/images/mobile-bg/hero-valley.jpg",
  "/images/mobile-bg/hero-peaks.jpg",
  "/images/mobile-bg/hero-meadow.jpg",
  "/images/mobile-bg/hero-river.jpg",
  "/images/mobile-bg/hero-coast.jpg",
  "/images/mobile-bg/hero-hills.jpg",
] as const;

export const MOBILE_BG_ROTATE_MS = 2 * 60 * 1000;
const STORAGE_KEY = "dayflow.mobileAtmosphere";

type MobileAtmosphereValue = {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  toggle: () => void;
  index: number;
  currentImage: string;
  imageCount: number;
};

const MobileAtmosphereContext = createContext<MobileAtmosphereValue | null>(
  null
);

export function MobileAtmosphereProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabledState] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) setEnabledState(raw === "1" || raw === "true");
    } catch {
      /* ignore */
    }
    setIndex(Math.floor(Math.random() * MOBILE_BG_IMAGES.length));
    setHydrated(true);
  }, []);

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MOBILE_BG_IMAGES.length);
    }, MOBILE_BG_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [hydrated, enabled]);

  // Prefetch upcoming backgrounds
  useEffect(() => {
    if (!hydrated || !enabled) return;
    for (let offset = 1; offset <= 2; offset += 1) {
      const src =
        MOBILE_BG_IMAGES[(index + offset) % MOBILE_BG_IMAGES.length];
      const img = new window.Image();
      img.src = src;
    }
  }, [hydrated, enabled, index]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (enabled) root.classList.add("df-mobile-atmosphere-on");
    else root.classList.remove("df-mobile-atmosphere-on");
    return () => root.classList.remove("df-mobile-atmosphere-on");
  }, [enabled, hydrated]);

  const value = useMemo<MobileAtmosphereValue>(
    () => ({
      enabled: hydrated ? enabled : false,
      setEnabled,
      toggle,
      index,
      currentImage: MOBILE_BG_IMAGES[index] || MOBILE_BG_IMAGES[0],
      imageCount: MOBILE_BG_IMAGES.length,
    }),
    [enabled, hydrated, setEnabled, toggle, index]
  );

  return (
    <MobileAtmosphereContext.Provider value={value}>
      {children}
    </MobileAtmosphereContext.Provider>
  );
}

export function useMobileAtmosphere() {
  const ctx = useContext(MobileAtmosphereContext);
  if (!ctx) {
    throw new Error(
      "useMobileAtmosphere must be used within MobileAtmosphereProvider"
    );
  }
  return ctx;
}
