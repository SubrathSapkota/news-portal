import { useState, useEffect } from "react";
import { api } from "../lib/api";

const FALLBACK = {
  leaderboard: {
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=970&h=90&fit=crop&crop=center",
    overlay_text: "",
    link_url: "",
  },
  sidebar: {
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=250&fit=crop&crop=center",
    overlay_text: "",
    link_url: "",
  },
};

const SIZE_MAP = {
  leaderboard: { w: 728, h: 90, maxH: 90 },
  "mid-article": { w: 728, h: 90, maxH: 90, apiSize: "leaderboard" },
  banner: { w: 970, h: 90, maxH: 90, apiSize: "leaderboard" },
  sidebar: { w: 300, h: 250, maxH: 250 },
  "sidebar-small": { w: 300, h: 250, maxH: 200, apiSize: "sidebar" },
};

let adCache = {};

async function fetchAd(apiSize) {
  if (adCache[apiSize]) return adCache[apiSize];

  try {
    const res = await fetch(
      api(`/ads/?size=${apiSize}&active_only=true`)
    );
    if (!res.ok) return null;
    const ads = await res.json();
    if (ads.length === 0) return null;
    const picked = ads[Math.floor(Math.random() * ads.length)];
    adCache[apiSize] = picked;
    setTimeout(() => { delete adCache[apiSize]; }, 60_000);
    return picked;
  } catch {
    return null;
  }
}

export default function AdPlaceholder({
  variant = "leaderboard",
  className = "",
}) {
  const conf = SIZE_MAP[variant] || SIZE_MAP.leaderboard;
  const apiSize = conf.apiSize || variant;

  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAd(apiSize).then(setAd);
  }, [apiSize]);

  const display = ad || FALLBACK[apiSize] || FALLBACK.leaderboard;

  const inner = (
    <div className="relative overflow-hidden rounded-lg border border-border/60 bg-surface">
      <img
        src={display.image_url || display.image}
        alt={display.overlay_text || "Advertisement"}
        className="w-full h-full object-cover block"
        style={{
          aspectRatio: `${conf.w}/${conf.h}`,
          maxHeight: conf.maxH,
        }}
        loading="lazy"
      />
      {display.overlay_text && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <p className="text-white font-bold text-sm sm:text-base lg:text-lg px-4 text-center drop-shadow-lg leading-snug">
            {display.overlay_text}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors cursor-pointer" />
    </div>
  );

  return (
    <div className={`relative group ${className}`}>
      <span className="block text-[9px] uppercase tracking-[0.2em] text-muted/50 mb-1.5 text-right">
        Advertisement
      </span>
      {display.link_url ? (
        <a
          href={display.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}
