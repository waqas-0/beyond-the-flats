import { clsx } from "@/lib/clsx";

/**
 * Decorative QR-style code (not a real scannable code) drawn as an SVG grid,
 * matching the blocky look used on the Profile and Feedback screens.
 */
const N = 21;

function isFinder(r: number, c: number) {
  const inBox = (br: number, bc: number) =>
    r >= br && r < br + 7 && c >= bc && c < bc + 7;
  return inBox(0, 0) || inBox(0, N - 7) || inBox(N - 7, 0);
}

function finderFill(r: number, c: number) {
  const ring = (br: number, bc: number) => {
    const lr = r - br;
    const lc = c - bc;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true; // outer ring
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true; // inner 3x3
    return false;
  };
  if (r < 7 && c < 7) return ring(0, 0);
  if (r < 7 && c >= N - 7) return ring(0, N - 7);
  if (r >= N - 7 && c < 7) return ring(N - 7, 0);
  return false;
}

export function QrCode({
  size = 168,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let on = false;
      if (isFinder(r, c)) on = finderFill(r, c);
      else on = ((r * 7 + c * 13 + r * c) % 3 === 0) && !(r < 8 && c < 8);
      if (on)
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${N} ${N}`}
      width={size}
      height={size}
      className={clsx("text-ink", className)}
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  );
}
