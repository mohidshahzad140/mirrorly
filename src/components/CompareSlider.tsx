"use client";
import { useState } from "react";

export function CompareSlider({ before, after, label }: { before: string; after: string; label: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-[24px] bg-well">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt="Before" className="absolute inset-0 h-full w-full object-contain" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={label} className="absolute inset-0 h-full w-full object-contain bg-well" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }} />
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <div
        className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-void"
        style={{ left: `${pos}%` }}
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5" /><path d="M15 7l5 5-5 5" /></svg>
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-void/60 px-3 py-1 text-xs font-medium">Before</span>
      <span className="absolute bottom-3 right-3 rounded-full bg-void/60 px-3 py-1 text-xs font-medium">After</span>
    </div>
  );
}
