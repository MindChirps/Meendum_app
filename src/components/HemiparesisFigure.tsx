/**
 * A simple front-facing human figure with one side highlighted in bright orange
 * to anchor Appa's attention to his affected (right) side.
 *
 * The figure faces the viewer, so the viewer's LEFT visual side corresponds to
 * Appa's anatomical RIGHT side (the affected side).
 */
export function HemiparesisFigure() {
  const grey = '#9CA3AF';
  const highlight = '#F97316'; // bright orange — affected side

  return (
    <svg
      viewBox="0 0 100 140"
      className="w-24 h-32"
      aria-label="உடல் வரைபடம்"
      role="img"
    >
      {/* Head */}
      <circle cx="50" cy="18" r="12" fill={grey} />

      {/* Torso */}
      <rect x="38" y="32" width="24" height="40" rx="4" fill={grey} />

      {/* Left arm (viewer's left = Appa's affected right side) */}
      <rect x="22" y="34" width="12" height="42" rx="6" fill={highlight} />

      {/* Right arm (viewer's right = Appa's unaffected left side) */}
      <rect x="66" y="34" width="12" height="42" rx="6" fill={grey} />

      {/* Left leg (viewer's left = Appa's affected right side) */}
      <rect x="36" y="74" width="12" height="50" rx="6" fill={highlight} />

      {/* Right leg (viewer's right = Appa's unaffected left side) */}
      <rect x="52" y="74" width="12" height="50" rx="6" fill={grey} />
    </svg>
  );
}
