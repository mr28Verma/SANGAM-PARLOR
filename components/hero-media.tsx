"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroMediaProps = {
  src: string;
  poster: string;
  posterAlt: string;
};

export function HeroMedia({ src, poster, posterAlt }: HeroMediaProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    video.defaultMuted = true;
    video.muted = true;

    if (reducedMotion) {
      video.pause();
      return;
    }

    let playRequest: Promise<void>;
    try {
      playRequest = video.play();
    } catch {
      return () => { cancelled = true; };
    }

    playRequest.catch((error: unknown) => {
      const errorName = typeof error === "object" && error !== null && "name" in error
        ? error.name
        : undefined;
      if (!cancelled && errorName !== "AbortError") video.pause();
    });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <div className="hero-media" aria-hidden="true">
      <Image className="hero-poster" src={poster} alt={posterAlt} fill priority sizes="100vw" />
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
