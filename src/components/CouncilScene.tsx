"use client";

import {useRef, useState, type CSSProperties} from "react";

type Portrait = {id: string; src: string; scale: number};

export function CouncilScene({portraits}: {portraits: Portrait[]}) {
  const [active, setActive] = useState(0);
  const start = useRef<{x: number; y: number} | null>(null);
  const count = portraits.length;
  const move = (direction: number) => setActive(index => (index + direction + count) % count);

  return <div className="qgCouncilScene" role="region" aria-label="Konsey portreleri"
    tabIndex={count > 1 ? 0 : undefined}
    onKeyDown={event => {
      if (count < 2) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
      }
    }}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return;
      start.current = {x: event.clientX, y: event.clientY};
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerCancel={() => {start.current = null;}}
    onPointerUp={event => {
      const origin = start.current; start.current = null;
      if (!origin || count < 2) return;
      const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
    }}>
    <div className="qgCouncilLayers" aria-hidden="true">
      {portraits.map((portrait, index) => {
        const offset = (index - active + count) % count;
        const position = offset === 0 ? "center" : offset === 1 ? "right" : offset === count - 1 ? "left" : "away";
        return <img key={portrait.id} className={`qgCouncilFigure qgCouncilFigure-${position}`}
          src={portrait.src} alt="" draggable={false} decoding="async" loading={index === 0 ? "eager" : "lazy"}
          style={{"--portrait-scale": portrait.scale / 100} as CSSProperties}/>;
      })}
    </div>
    {count > 1 && <div className="qgCouncilNavigation">
      <div role="group" aria-label="Portre seçimi">{portraits.map((portrait, index) =>
        <button key={portrait.id} type="button" aria-label={index === 0 ? "Quad portresi" : `Konsey portresi ${index + 1}`}
          aria-pressed={active === index} onClick={() => setActive(index)}><span/></button>)}</div>
      <span className="qgCouncilStatus" aria-live="polite">Portre {active + 1} / {count}</span>
    </div>}
  </div>;
}
