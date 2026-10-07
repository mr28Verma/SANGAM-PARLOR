"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type HeroMediaProps = {
  src: string;
  poster: string;
  posterAlt: string;
};

export function HeroMedia({ src, poster, posterAlt }: HeroMediaProps) {
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobilePreference = window.matchMedia("(max-width: 760px)");
    const shouldPlayVideo = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      setCanPlayVideo(!motionPreference.matches && !mobilePreference.matches && !connection?.saveData);
    };
    shouldPlayVideo();
    motionPreference.addEventListener("change", shouldPlayVideo);
    mobilePreference.addEventListener("change", shouldPlayVideo);
    return () => {
      motionPreference.removeEventListener("change", shouldPlayVideo);
      mobilePreference.removeEventListener("change", shouldPlayVideo);
    };
  }, []);

  return (
    <div className="hero-media" aria-hidden="true">
      <Image className="hero-poster" src={poster} alt={posterAlt} fill priority sizes="100vw" />
      {canPlayVideo && !videoFailed && <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        onError={() => setVideoFailed(true)}
      >
        <source src={src} type="video/mp4" />
      </video>}
    </div>
  );
}
