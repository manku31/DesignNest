import type { CSSProperties } from "react";

// A crisp, scalable pendant illustration complements the stock interior photography.
export default function Pendant({
  color = "#F5A55A",
  brightness = 64,
  variant = "dome",
}: {
  color?: string;
  brightness?: number;
  variant?: "dome" | "pleated";
}) {
  return (
    <div
      className={`pendant pendant-${variant}`}
      style={
        {
          "--lamp-color": color,
          "--lamp-intensity": brightness / 100,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="pendant-wire" />
      <div className="pendant-cap" />
      <div className="pendant-shade" />
      <div className="pendant-rim" />
      <div className="pendant-light" />
    </div>
  );
}
