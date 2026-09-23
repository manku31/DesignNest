import { Check } from "lucide-react";
import type { lightingPresets } from "../data/mockData";
import Pendant from "./Pendant";

export default function PresetCard({
  preset,
  active,
  onClick,
}: {
  preset: (typeof lightingPresets)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`preset-card active:scale-95 ${active ? "selected" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span className="preset-check">{active && <Check size={10} />}</span>
      <Pendant color={preset.tint} brightness={preset.brightness} />
      <span className="preset-name">{preset.name}</span>
      <span className="preset-subtitle">{preset.subtitle}</span>
    </button>
  );
}
