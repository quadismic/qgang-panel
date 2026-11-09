"use client";
import {presentationImage,thumbnail} from "@/lib/presentation-image";
import { useId } from "react";
/** Asset coordinates, shared at every size. No viewport-specific ornament offsets. */
export function RankPortrait({
  role,
  src,
  name,
  size = "profile",
}: {
  role: string;
  src?: string | null;
  name: string;
  size?: "profile" | "card";
}) {
  const id = useId().replace(/:/g, "");
  const founder = role === "founder",
    decorated = ["founder", "admin", "moderator"].includes(role),
    captain = role === "moderator";
  const top = founder ? 290 : 0,
    width = captain ? 1254 : 1278,
    height = captain ? 1254 : 1230;
  const photo = {
    x: captain ? 185 : 180,
    y: top + (captain ? 145 : 160),
    w: captain ? 890 : 900,
    h: captain ? 930 : 870,
  };
  return (
    <span className={`qgPortrait qgPortrait-${size}`}>
      <svg
        viewBox={`0 0 ${width} ${height + top}`}
        role="img"
        aria-label={`${name} profil resmi`}
      >
        <defs>
          <clipPath id={id}>
            <rect
              x={decorated ? photo.x : 130}
              y={decorated ? photo.y : 130}
              width={decorated ? photo.w : 1018}
              height={decorated ? photo.h : 970}
              rx="65"
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`}>
          <rect width={width} height={height + top} fill="#17110d" />
          {src ? (
            <image
              href={thumbnail(src,size==="card"?256:480)}
              x={decorated ? photo.x : 130}
              y={decorated ? photo.y : 130}
              width={decorated ? photo.w : 1018}
              height={decorated ? photo.h : 970}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <text
              x={width / 2}
              y={(height + top) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ddc9ae"
              fontSize="420"
            >
              {name.slice(0, 1).toUpperCase()}
            </text>
          )}
        </g>
        {decorated && (
          <image
            href={presentationImage(`/assets/ranks/${captain ? "captain" : "leader"}-frame.png`,size==="card"?480:960)}
            x="0"
            y={top}
            width={width}
            height={height}
          />
        )}
        {founder && (
          <image
            href={presentationImage("/assets/ranks/leader-crown.png",size==="card"?240:480)}
            x="324"
            y="0"
            width="630"
            height="315"
          />
        )}
      </svg>
    </span>
  );
}
