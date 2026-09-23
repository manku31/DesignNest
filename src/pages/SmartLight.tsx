import { useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  Check,
  Power,
  SlidersHorizontal,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { initialLight } from "../data/mockData";
import { useApp } from "../state/AppContext";
import BrightnessArc from "../components/BrightnessArc";
import Chip from "../components/Chip";
import GlassCard from "../components/GlassCard";
import IconButton from "../components/IconButton";
import Image from "../components/Image";
import Pendant from "../components/Pendant";
import Modal from "../components/Modal";

export default function SmartLight() {
  const [params] = useSearchParams();
  const roomId = params.get("room") ?? "living-room";
  const {
    lights,
    updateLight,
    rooms,
    images,
    content: { lightColors },
  } = useApp();
  const [device, setDevice] = useState(1);
  const [details, setDetails] = useState(false);
  const key = device === 1 ? roomId : `${roomId}-device-2`;
  const light =
    lights[key] ??
    (device === 1 ? initialLight : { ...initialLight, brightness: 42 });
  const selectedColor =
    lightColors.find((color) => color.name === light.color) ?? lightColors[0];
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  if (!room)
    return (
      <main className="page empty-state">
        <h1>Your next space starts here.</h1>
        <Link to="/customize" className="primary-button">
          Add a space
        </Link>
      </main>
    );
  function setLight(update: Partial<typeof initialLight>) {
    updateLight(key, { ...light, ...update });
  }
  return (
    <main
      className={`smart-light-page page-enter ${light.power ? "" : "smart-light-off"}`}
      style={
        {
          "--glow-color": selectedColor.value,
          "--glow-opacity": light.power ? light.brightness / 130 : 0,
        } as CSSProperties
      }
    >
      <div className="smart-background">
        <Image src={room.image || images.living} alt="" />
        <div />
      </div>
      <div className="ambient-glow" />
      <header className="smart-header">
        <Link
          className="icon-button glass-button"
          to={`/room/${room.id}`}
          aria-label="Back to room"
        >
          <ArrowLeft size={19} />
        </Link>
        <div className="device-tabs">
          <Chip active={device === 1} onClick={() => setDevice(1)}>
            Device 1
          </Chip>
          <Chip active={device === 2} onClick={() => setDevice(2)}>
            Device 2
          </Chip>
        </div>
        <IconButton
          label="Light information"
          className="glass-button"
          onClick={() => setDetails(true)}
        >
          <SlidersHorizontal size={18} />
        </IconButton>
      </header>
      <div className="smart-title">
        <p className="eyebrow">{room.name.toUpperCase()} · YOUR AMBIANCE</p>
        <h1>
          Smart Light<span>.</span>
        </h1>
        <span className="device-status">
          <span />
          {light.power
            ? "A little glow goes a long way"
            : "Your light is resting"}
        </span>
      </div>
      <div className={`smart-pendant device-${device}`}>
        <Pendant
          color={selectedColor.value}
          brightness={light.power ? light.brightness : 0}
          variant={device === 1 ? "dome" : "pleated"}
        />
        <span className="light-model">
          {device === 1 ? "THE DOME PENDANT" : "THE FOLD PENDANT"}
        </span>
      </div>
      <BrightnessArc
        value={light.brightness}
        onChange={(value) => setLight({ brightness: value })}
        disabled={!light.power}
      />
      <div className="light-colors" aria-label="Light color">
        {lightColors.map((color) => (
          <button
            key={color.name}
            onClick={() => setLight({ color: color.name, power: true })}
            aria-label={color.name}
            aria-pressed={light.color === color.name}
            className={`color-dot ${light.color === color.name ? "color-selected" : ""}`}
            style={{ "--dot-color": color.value } as CSSProperties}
          >
            <span>{light.color === color.name && <Check size={12} />}</span>
          </button>
        ))}
      </div>
      <p className="light-color-label">
        {selectedColor.name}
        <span> · </span>Made for slow evenings
      </p>
      <GlassCard className="smart-power-card">
        <span className="smart-power-icon">
          <Sparkles size={20} strokeWidth={1.3} />
        </span>
        <div>
          <h2>Your perfect atmosphere</h2>
          <p>
            {light.power
              ? "Just the way you like it."
              : "One touch to bring it back."}
          </p>
        </div>
        <IconButton
          label={light.power ? "Turn light off" : "Turn light on"}
          aria-pressed={light.power}
          className={`smart-power-toggle ${light.power ? "on" : ""}`}
          onClick={() => setLight({ power: !light.power })}
        >
          <Power size={19} />
        </IconButton>
      </GlassCard>
      {details && (
        <Modal title={`Device ${device}`} onClose={() => setDetails(false)}>
          <p className="modal-description">
            {device === 1 ? "The Dome" : "The Fold"} pendant brings a soft,
            considered glow to your {room.name.toLowerCase()}.
          </p>
          <div className="detail-stat">
            <span>Location</span>
            <strong>{room.name}</strong>
          </div>
          <div className="detail-stat">
            <span>Brightness</span>
            <strong>{light.brightness}%</strong>
          </div>
          <div className="detail-stat">
            <span>Color</span>
            <strong>{light.color}</strong>
          </div>
          <div className="demo-note">
            <Wifi size={17} />
            <p>
              Preview mode. Your preferences stay in this session; no physical
              light is connected.
            </p>
          </div>
          <button className="primary-button" onClick={() => setDetails(false)}>
            All set
            <Check size={18} />
          </button>
        </Modal>
      )}
    </main>
  );
}
