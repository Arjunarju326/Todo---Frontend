"use client";

import React, { useEffect, useState } from "react";
import { useMobileAtmosphere } from "@/lib/mobileAtmosphere";

/** Full-bleed scenic backdrop for mobile only, with soft crossfade. */
export default function MobileAtmosphereBackground() {
  const { enabled, currentImage, index } = useMobileAtmosphere();
  const [showA, setShowA] = useState(true);
  const [layerA, setLayerA] = useState(currentImage);
  const [layerB, setLayerB] = useState(currentImage);
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPrimed(false);
      return;
    }
    if (!primed) {
      setLayerA(currentImage);
      setLayerB(currentImage);
      setShowA(true);
      setPrimed(true);
      return;
    }
    if (showA) {
      setLayerB(currentImage);
      setShowA(false);
    } else {
      setLayerA(currentImage);
      setShowA(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rotate on index only
  }, [index, currentImage, enabled, primed]);

  if (!enabled) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-0 pointer-events-none overflow-hidden df-atmosphere-root"
      aria-hidden
      style={{ height: "100dvh" }}
    >
      {/* Solid base so overscroll never flashes empty/white */}
      <div className="absolute inset-0 bg-[var(--background)]" />
      {/* CSS backgrounds (not <img>) — more stable while scrolling on mobile */}
      <div
        className={`df-atmosphere-layer absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ease-in-out ${
          showA ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url("${layerA}")` }}
      />
      <div
        className={`df-atmosphere-layer absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1400ms] ease-in-out ${
          showA ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url("${layerB}")` }}
      />
      {/* Soft wash so text/cards stay readable while scenery stays visible */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,245,238,0.28)_0%,rgba(246,245,238,0.18)_40%,rgba(246,245,238,0.32)_72%,rgba(246,245,238,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
    </div>
  );
}
