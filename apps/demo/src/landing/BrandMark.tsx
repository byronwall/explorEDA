const CELLS = [
  [4, 4],
  [24, 4],
  [44, 4],
  [4, 24],
  [44, 24],
  [4, 44],
  [24, 44],
  [44, 44],
] as const;

/** The logo's icon in the current text color, with its teal center. */
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g fill="currentColor">
        {CELLS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="16" height="16" rx="2.5" />
        ))}
      </g>
      <rect x="24" y="24" width="16" height="16" rx="2.5" fill="#01ADB7" />
    </svg>
  );
}
