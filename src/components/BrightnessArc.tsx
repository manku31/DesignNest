import { Sun, SunDim } from "lucide-react";

export default function BrightnessArc({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const angle = Math.PI * (1 - value / 100);
  const x = 150 + 128 * Math.cos(angle);
  const y = 145 - 128 * Math.sin(angle);
  return (
    <div className={`brightness-arc ${disabled ? "arc-disabled" : ""}`}>
      <svg viewBox="0 0 300 175" aria-hidden="true">
        <path
          d="M22 145 A128 128 0 0 1 278 145"
          fill="none"
          stroke="rgba(255,255,255,.18)"
          strokeWidth="2"
        />
        <path
          d="M22 145 A128 128 0 0 1 278 145"
          fill="none"
          stroke="#F5F1EA"
          strokeWidth="2.5"
          pathLength="100"
          strokeDasharray={`${value} 100`}
        />
        <circle cx={x} cy={y} r="8" fill="#FFF9E8" />
        <circle cx={x} cy={y} r="14" fill="#FFF9E8" opacity=".09" />
      </svg>
      <div className="arc-value">
        <span>
          {value}
          <small>%</small>
        </span>
        <p>Brightness</p>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Light brightness"
        aria-valuetext={`${value} percent`}
        disabled={disabled}
      />
      <div className="arc-labels">
        <SunDim size={16} />
        <span>Slide to set the mood</span>
        <Sun size={18} />
      </div>
    </div>
  );
}
