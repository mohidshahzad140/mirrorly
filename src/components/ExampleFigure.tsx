/** A drawn stand-in figure for example cards. Clearly an illustration, not a real try-on. */
export function ExampleFigure({ skin, hair, top, bottom }: { skin: string; hair: string; top: string; bottom: string }) {
  return (
    <svg viewBox="0 0 200 360" className="h-full w-full" aria-hidden>
      <circle cx="100" cy="52" r="26" fill={skin} />
      <path d="M70 50 Q70 18 100 20 Q130 18 130 50 Q124 32 100 32 Q78 32 70 50 Z" fill={hair} />
      <rect x="92" y="72" width="16" height="16" fill={skin} />
      <path d="M44 150 L48 214" stroke={skin} strokeWidth="12" strokeLinecap="round" />
      <path d="M156 150 L152 214" stroke={skin} strokeWidth="12" strokeLinecap="round" />
      <path d="M64 200 L136 200 L134 330 L108 330 L100 232 L92 330 L66 330 Z" fill={bottom} />
      <path d="M54 88 Q100 76 146 88 L166 160 L144 166 L140 212 L60 212 L56 166 L34 160 Z" fill={top} />
      <ellipse cx="80" cy="334" rx="16" ry="6" fill="#FFFFFF" />
      <ellipse cx="120" cy="334" rx="16" ry="6" fill="#FFFFFF" />
    </svg>
  );
}
