"use client";
import {thumbnail} from "@/lib/presentation-image";
import { useId } from "react";
/** Asset coordinates, shared at every size. No viewport-specific ornament offsets. */
export function RankPortrait({
  src,
  name,
  size = "profile",
}: {
  src?: string | null;
  name: string;
  size?: "profile" | "card";
}) {
  const id = useId().replace(/:/g, "");
  const width = 1000, height = 1000;
  return (
    <span className={`qgPortrait qgPortrait-${size}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${name} profil resmi`}
      >
        <defs>
          <clipPath id={id}>
            <rect
              x="92"
              y="92"
              width="816"
              height="816"
              rx="72"
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`}>
          <rect width={width} height={height} fill="var(--qg-theme-surface,#17110d)" />
          {src ? (
            <image
              href={thumbnail(src,size==="card"?256:480)}
              x="92"
              y="92"
              width="816"
              height="816"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--qg-theme-text,#ddc9ae)"
              fontSize="420"
            >
              {name.slice(0, 1).toUpperCase()}
            </text>
          )}
        </g>
        <rect x="48" y="48" width="904" height="904" rx="100" fill="none" stroke="var(--qg-theme-line,#614739)" strokeWidth="20"/>
        <rect x="72" y="72" width="856" height="856" rx="84" fill="none" stroke="var(--qg-theme-accent,#e3b27e)" strokeOpacity=".6" strokeWidth="5"/>
      </svg>
    </span>
  );
}
