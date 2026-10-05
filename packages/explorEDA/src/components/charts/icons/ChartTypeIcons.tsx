// Chart type icons drawn like lucide's, for chart forms lucide does not have.
const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Adjacent vertical bins over a baseline. */
export function HistogramIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 17v-5h4v5" />
      <path d="M11 17V7h4v10" />
      <path d="M15 17v-7h4v7" />
    </svg>
  );
}

/** Three parallel axes crossed by one row's line. */
export function ParallelCoordinatesIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 3v18" />
      <path d="M12 3v18" />
      <path d="M20 3v18" />
      <path d="m4 15 8-8 8 10" />
    </svg>
  );
}
