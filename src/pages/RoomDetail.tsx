import { useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Heart,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Sun,
  SunDim,
  Timer,
  Lightbulb,
  Leaf,
  Scan,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { initialLight } from "../data/mockData";
import RoomEditor from "../components/RoomEditor";
import { useApp } from "../state/AppContext";
import Chip from "../components/Chip";
import GlassCard from "../components/GlassCard";
import IconButton from "../components/IconButton";
import Image from "../components/Image";
import Modal from "../components/Modal";
import PresetCard from "../components/PresetCard";

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export default function RoomDetail() {
  const { id = "living-room" } = useParams();
  const {
    rooms,
    favorites,
    toggleFavorite,
    lights,
    updateLight,
    directions,
    notify,
    content: { furnishings, lightingPresets, wallColors, decor: decorItems },
    roomSettings,
    updateRoomSettings,
  } = useApp();
  const room = rooms.find((item) => item.id === id);
  const light = lights[id] ?? initialLight;
  const [tab, setTab] = useState("Lighting");
  const [sheet, setSheet] = useState<"schedule" | "details" | "edit" | null>(
    null,
  );
  const [from, setFrom] = useState(light.from);
  const [until, setUntil] = useState(light.until);
  const [galleryPhoto, setGalleryPhoto] = useState<string | null>(null);
  const settings = roomSettings[id];
  const wallColor =
    wallColors.find((color) => color.name === settings?.wallColor) ??
    wallColors[0];
  const addedFurniture = settings?.furniture ?? [];
  const decor =
    decorItems.find((item) => item.name === settings?.decor) ?? decorItems[0];
  if (!room)
    return (
      <main className="page empty-state page-enter">
        <Lightbulb size={38} />
        <h1>A space yet to be imagined</h1>
        <p>This room isn’t in your collection.</p>
        <Link to="/home" className="primary-button">
          Find your way home
          <ArrowUpRight size={18} />
        </Link>
      </main>
    );

  function saveSchedule(event: FormEvent) {
    event.preventDefault();
    updateLight(id, { from, until });
    setSheet(null);
    notify("Your evening ritual is scheduled");
  }

  return (
    <main className="room-page page-enter">
      <section
        className={`room-hero ${!light.power ? "lights-off" : ""}`}
        style={
          {
            "--room-tint":
              tab === "Colors"
                ? wallColor.value
                : (lightingPresets.find((preset) => preset.id === light.preset)
                    ?.tint ?? "#F5A55A"),
            "--brightness": light.power ? 0.65 + light.brightness / 200 : 0.38,
          } as CSSProperties
        }
      >
        <Image
          src={room.image}
          alt={`${room.name} with warm, natural materials and modern furnishings`}
        />
        <div className="room-tint" />
        <div className="room-hero-overlay" />
        <header className="room-header">
          <Link
            to="/home"
            className="icon-button glass-button"
            aria-label="Back to home"
          >
            <ArrowLeft size={19} />
          </Link>
          <span>YOUR PERSONAL SANCTUARY</span>
          <div className="flex">
            <IconButton
              label={
                favorites.includes(id)
                  ? "Remove room from favorites"
                  : "Save room to favorites"
              }
              aria-pressed={favorites.includes(id)}
              className="glass-button"
              onClick={() => toggleFavorite(id)}
            >
              <Heart
                size={19}
                fill={favorites.includes(id) ? "currentColor" : "none"}
              />
            </IconButton>
            <IconButton
              label="Room options"
              className="glass-button"
              onClick={() => setSheet("details")}
            >
              <MoreHorizontal size={20} />
            </IconButton>
          </div>
        </header>
        <Link
          to={room.panorama ? `/tour/${room.id}` : "/customize"}
          className="room-tour-link"
        >
          <Scan size={15} />
          <span>{room.panorama ? "Explore 360°" : "Add a 360° view"}</span>
          <ArrowUpRight size={13} />
        </Link>
        <div className="room-title">
          <span className="room-kicker">
            <span className="tiny-dot" />A LITTLE MORE YOU
          </span>
          <h1>{room.name}</h1>
          <p>
            Design the perfect ambiance
            <br />
            for your space.
          </p>
        </div>
        <div className="room-power-row">
          <IconButton
            label={light.power ? "Turn lights off" : "Turn lights on"}
            aria-pressed={light.power}
            className={`power-button ${light.power ? "power-on" : ""}`}
            onClick={() => updateLight(id, { power: !light.power })}
          >
            <Power size={20} />
          </IconButton>
          <span>
            {light.power
              ? "Let there be a little warmth."
              : "A moment of quiet."}
          </span>
          <span className="power-status">{light.power ? "ON" : "OFF"}</span>
        </div>
      </section>
      <div className="room-controls">
        <div className="brightness-control">
          <SunDim size={18} />
          <input
            aria-label="Room brightness"
            type="range"
            min="0"
            max="100"
            value={light.brightness}
            disabled={!light.power}
            onChange={(event) =>
              updateLight(id, { brightness: Number(event.target.value) })
            }
            style={
              { "--range-progress": `${light.brightness}%` } as CSSProperties
            }
          />
          <Sun size={19} />
          <output>{light.brightness}%</output>
        </div>
        <div className="room-tabs" aria-label="Room controls">
          {["Lighting", "Colors", "Furniture", "Decor"].map((item) => (
            <Chip key={item} active={tab === item} onClick={() => setTab(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <section
          className="room-tab-panel"
          key={tab}
          aria-label={`${tab} options`}
        >
          {tab === "Lighting" && (
            <>
              <div className="control-heading">
                <h2>Find your glow</h2>
                <span>
                  {
                    lightingPresets.find((preset) => preset.id === light.preset)
                      ?.temperature
                  }
                </span>
              </div>
              <div className="presets-grid">
                {lightingPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    active={light.preset === preset.id}
                    onClick={() =>
                      updateLight(id, {
                        preset: preset.id,
                        brightness: preset.brightness,
                        power: true,
                      })
                    }
                  />
                ))}
              </div>
            </>
          )}
          {tab === "Colors" && (
            <>
              <div className="control-heading">
                <h2>A palette that feels like you</h2>
              </div>
              <div className="wall-swatches">
                {wallColors.map((color) => (
                  <button
                    aria-label={color.name}
                    aria-pressed={wallColor.name === color.name}
                    key={color.name}
                    onClick={() =>
                      updateRoomSettings(id, { wallColor: color.name })
                    }
                    className={
                      wallColor.name === color.name ? "swatch-selected" : ""
                    }
                    style={{ "--swatch-color": color.value } as CSSProperties}
                  >
                    <span>
                      {wallColor.name === color.name && <Check size={17} />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="selected-color">
                <span>{wallColor.name}</span>
                <small>WALL COLOR PREVIEW</small>
              </p>
            </>
          )}
          {tab === "Furniture" && (
            <>
              <div className="control-heading">
                <h2>Made for your space</h2>
                <span>{addedFurniture.length} selected</span>
              </div>
              <div className="furnishing-grid">
                {furnishings.map((item) => (
                  <div className="furnishing-card" key={item.id}>
                    <Image src={item.image} alt={item.name} />
                    <IconButton
                      label={
                        addedFurniture.includes(item.id)
                          ? `Remove ${item.name}`
                          : `Add ${item.name}`
                      }
                      aria-pressed={addedFurniture.includes(item.id)}
                      onClick={() =>
                        updateRoomSettings(id, {
                          furniture: addedFurniture.includes(item.id)
                            ? addedFurniture.filter(
                                (entry) => entry !== item.id,
                              )
                            : [...addedFurniture, item.id],
                        })
                      }
                    >
                      {addedFurniture.includes(item.id) ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </IconButton>
                    <h3>{item.name}</h3>
                    <p>{item.material}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "Decor" && (
            <>
              <div className="control-heading">
                <h2>It’s all in the details</h2>
                <Leaf size={16} />
              </div>
              <div className="decor-preview">
                <Image src={decor.image} alt={decor.name} />
                <span>
                  {decor.name}
                  <small>{decor.description}</small>
                </span>
              </div>
              <div className="filter-row">
                {decorItems.map((item) => (
                  <Chip
                    key={item.id}
                    active={decor.id === item.id}
                    onClick={() => updateRoomSettings(id, { decor: item.name })}
                  >
                    {item.name}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </section>
        <GlassCard className="schedule-card">
          <div className="schedule-title">
            <h2>
              <Timer size={15} />
              Your evening ritual
            </h2>
            <IconButton
              label="Edit lighting schedule"
              onClick={() => {
                setFrom(light.from);
                setUntil(light.until);
                setSheet("schedule");
              }}
            >
              <Pencil size={15} />
            </IconButton>
          </div>
          <div className="schedule-times">
            <div>
              <span>From</span>
              <strong>{formatTime(light.from)}</strong>
            </div>
            <span className="schedule-line" />
            <div>
              <span>Until</span>
              <strong>{formatTime(light.until)}</strong>
            </div>
            <span className="schedule-daily">EVERY DAY</span>
          </div>
        </GlassCard>
        {tab === "Lighting" && (
          <Link to={`/light?room=${id}`} className="fine-tune">
            <Lightbulb size={15} />
            <span>A little more control</span>
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      {room.gallery?.some(Boolean) && (
        <section className="room-gallery page">
          <h2>A closer look</h2>
          <div className="room-gallery-strip no-scrollbar">
            {room.gallery.filter(Boolean).map((image, index) => (
              <button
                key={image + index}
                onClick={() => setGalleryPhoto(image)}
                aria-label={`Open gallery photo ${index + 1}`}
              >
                <Image src={image} alt={`${room.name}, photo ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>
      )}
      {galleryPhoto && (
        <Modal title={room.name} onClose={() => setGalleryPhoto(null)}>
          <Image className="gallery-full" src={galleryPhoto} alt={room.name} />
        </Modal>
      )}
      {sheet === "edit" && (
        <RoomEditor room={room} onClose={() => setSheet(null)} />
      )}
      {sheet === "schedule" && (
        <Modal title="Set your evening ritual" onClose={() => setSheet(null)}>
          <form onSubmit={saveSchedule}>
            <p className="modal-description">
              A warm welcome home, right on time. Your lights follow this
              schedule is saved with this room. Connected-light control is a
              preview.
            </p>
            <div className="time-fields">
              <label className="field-label">
                From
                <input
                  type="time"
                  required
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label className="field-label">
                Until
                <input
                  type="time"
                  required
                  value={until}
                  onChange={(event) => setUntil(event.target.value)}
                />
              </label>
            </div>
            {until <= from && (
              <p className="fine-print">
                Your schedule continues until the following day.
              </p>
            )}
            <button className="primary-button" type="submit">
              Save schedule
              <Check size={18} />
            </button>
          </form>
        </Modal>
      )}
      {sheet === "details" && (
        <Modal title={room.name} onClose={() => setSheet(null)}>
          <Image
            className="detail-modal-image"
            src={room.image}
            alt={room.name}
          />
          <p className="modal-description">
            {room.description} Thoughtfully put together, just for you.
          </p>
          <div className="detail-stat">
            <span>Project status</span>
            <strong>{room.status}</strong>
          </div>
          <div className="detail-stat">
            <span>Design direction</span>
            <strong>{directions[id] ?? "Warm minimalism"}</strong>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              toggleFavorite(id);
              notify(
                favorites.includes(id)
                  ? "Room removed from your favorites"
                  : "Room saved to your favorites",
              );
              setSheet(null);
            }}
          >
            <Heart size={18} />
            {favorites.includes(id)
              ? "Remove from favorites"
              : "Save to favorites"}
          </button>
          <button className="secondary-button" onClick={() => setSheet("edit")}>
            <Pencil size={17} />
            Edit space & photos
          </button>
          <Link className="secondary-button" to={`/light?room=${id}`}>
            Open smart light
            <ArrowUpRight size={17} />
          </Link>
        </Modal>
      )}
    </main>
  );
}
