import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Compass,
  Info,
  LoaderCircle,
  Maximize,
  Minimize,
  Minus,
  Move,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scan,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { tourSpeeds, type Room, type RoomPanorama } from "../data/mockData";
import { useApp } from "../state/AppContext";
import IconButton from "../components/IconButton";
import Image from "../components/Image";
import Modal from "../components/Modal";
import PanoramaViewer, {
  type PanoramaControls,
  type PanoramaView,
} from "../components/PanoramaViewer";

function TourExperience({
  room,
  panorama,
}: {
  room: Room;
  panorama: RoomPanorama;
}) {
  const { rooms } = useApp();
  const tourRooms = rooms.filter((item) => item.panorama);
  const root = useRef<HTMLElement>(null);
  const controls = useRef<PanoramaControls>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [view, setView] = useState<PanoramaView>({
    yaw: panorama.yaw,
    pitch: panorama.pitch,
    hfov: panorama.hfov,
  });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [retry, setRetry] = useState(0);
  const angle = ((Math.round(view.yaw) % 360) + 360) % 360;
  const ready = status === "ready";

  useEffect(() => {
    const fullscreenChanged = () =>
      setFullscreen(document.fullscreenElement === root.current);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    const visibilityChanged = () => {
      if (document.hidden) {
        controls.current?.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("fullscreenchange", fullscreenChanged);
    document.addEventListener("keydown", escape);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChanged);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, []);

  function pauseTour() {
    controls.current?.pause();
    setPlaying(false);
  }
  function toggleTour() {
    if (playing) pauseTour();
    else {
      controls.current?.play(tourSpeeds[speed].degreesPerSecond);
      setPlaying(true);
      setInteracted(true);
    }
  }
  async function toggleFullscreen() {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (expanded) setExpanded(false);
    else {
      // iOS browsers that lack element fullscreen still get an expanded view.
      try {
        if (!root.current?.requestFullscreen)
          throw new Error("Fullscreen unavailable");
        await root.current.requestFullscreen();
      } catch {
        setExpanded(true);
      }
    }
  }

  return (
    <main
      ref={root}
      className={`tour-page ${expanded ? "is-expanded" : ""}`}
      data-status={status}
      data-playing={playing}
    >
      <PanoramaViewer
        key={retry}
        ref={controls}
        panorama={panorama}
        onReady={() => setStatus("ready")}
        onError={() => {
          setStatus("error");
          setPlaying(false);
        }}
        onInteraction={() => {
          setPlaying(false);
          setInteracted(true);
        }}
        onViewChange={setView}
      />
      <div className="tour-top-shade" />
      <div className="tour-bottom-shade" />
      <header className="tour-header">
        <Link
          to={`/room/${room.id}`}
          className="icon-button tour-glass"
          aria-label="Back to room"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="tour-brand">
          <Scan size={21} strokeWidth={1.4} />
          <span>
            DESIGNNEST<small>360° STUDIO</small>
          </span>
        </div>
        <IconButton
          label="About the 360 degree tour"
          className="tour-glass"
          onClick={() => {
            pauseTour();
            setShowInfo(true);
          }}
        >
          <Info size={19} />
        </IconButton>
      </header>

      {ready && (
        <>
          <div className="tour-badges">
            <span>
              <span className="tiny-dot" />
              {playing ? "AUTO TOUR" : "LOOK AROUND"}
            </span>
            <span>
              <Sparkles size={11} />
              {room.panorama?.startsWith("/panoramas/")
                ? "AI concept"
                : "Your panorama"}
            </span>
          </div>
          <div className="tour-zoom-controls tour-glass">
            <IconButton
              label="Zoom in"
              disabled={view.hfov <= 40.5}
              onClick={() => {
                pauseTour();
                controls.current?.zoom(-8);
              }}
            >
              <Plus size={19} />
            </IconButton>
            <span className="tour-zoom-divider" />
            <IconButton
              label="Zoom out"
              disabled={view.hfov >= 94.5}
              onClick={() => {
                pauseTour();
                controls.current?.zoom(8);
              }}
            >
              <Minus size={19} />
            </IconButton>
            <span className="tour-zoom-divider" />
            <IconButton
              label="Reset view"
              onClick={() => {
                pauseTour();
                controls.current?.reset();
              }}
            >
              <RotateCcw size={17} />
            </IconButton>
          </div>
          {!interacted && (
            <div className="tour-drag-hint" aria-hidden="true">
              <Move size={22} strokeWidth={1.2} />
              <span>Drag to discover</span>
              <small>A whole new point of view.</small>
            </div>
          )}
        </>
      )}

      {status === "loading" && (
        <div className="tour-status" role="status">
          <span className="tour-loading-orbit">
            <LoaderCircle size={28} />
          </span>
          <h2>Make yourself at home.</h2>
          <p>Your 360° space is opening…</p>
        </div>
      )}
      {status === "error" && (
        <div className="tour-status tour-error" role="alert">
          <Compass size={32} strokeWidth={1.3} />
          <h2>Let’s try that view again.</h2>
          <p>
            The panorama couldn’t open. Please try again in a browser with WebGL
            enabled.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setStatus("loading");
              setRetry((value) => value + 1);
            }}
          >
            Try again
            <RotateCcw size={16} />
          </button>
          <a
            href={panorama.image}
            target="_blank"
            rel="noreferrer"
            className="secondary-button"
          >
            Open the panorama image
            <ArrowUpRight size={16} />
          </a>
        </div>
      )}

      <section className="tour-bottom-panel">
        <div className="tour-heading">
          <div>
            <p className="eyebrow">A LITTLE MORE PERSPECTIVE</p>
            <h1>
              {room.name}
              <span>.</span>
            </h1>
            <p>{panorama.title}</p>
          </div>
          <div
            className="tour-compass"
            style={{ "--view-angle": `${-view.yaw}deg` } as CSSProperties}
          >
            <Compass size={29} strokeWidth={1} />
            <output aria-label="Viewing direction">{angle}°</output>
          </div>
        </div>
        <div className="tour-playback">
          <button
            className={`tour-play-button ${playing ? "playing" : ""}`}
            disabled={!ready}
            aria-pressed={playing}
            onClick={toggleTour}
          >
            {playing ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" />
            )}
            <span>{playing ? "Pause tour" : "Play tour"}</span>
            <span className="tour-play-detail">360°</span>
          </button>
          <button
            className="tour-speed tour-glass"
            aria-label={`Tour speed ${tourSpeeds[speed].label}`}
            disabled={!ready}
            onClick={() => {
              const next = (speed + 1) % tourSpeeds.length;
              setSpeed(next);
              if (playing)
                controls.current?.play(tourSpeeds[next].degreesPerSecond);
            }}
          >
            {tourSpeeds[speed].label}
          </button>
          <IconButton
            className="tour-glass"
            label={
              fullscreen || expanded ? "Exit expanded view" : "Expand view"
            }
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen || expanded ? (
              <Minimize size={19} />
            ) : (
              <Maximize size={19} />
            )}
          </IconButton>
        </div>
        <div className="tour-rooms-heading">
          <span>EXPLORE THE HOME</span>
          <span>
            {String(
              tourRooms.findIndex((item) => item.id === room.id) + 1,
            ).padStart(2, "0")}{" "}
            <i>/ {String(tourRooms.length).padStart(2, "0")}</i>
          </span>
        </div>
        <div className="tour-room-strip" aria-label="Choose a room to explore">
          {tourRooms.map((item) => (
            <Link
              to={`/tour/${item.id}`}
              key={item.id}
              aria-label={`Explore ${item.name} in 360 degrees`}
              aria-current={item.id === panorama.id ? "page" : undefined}
              className={`tour-room-choice ${item.id === panorama.id ? "selected" : ""}`}
            >
              <Image
                src={item.panorama!}
                alt={`${item.name} panorama preview`}
              />
              <span>{item.name}</span>
              {item.id === panorama.id && (
                <i>
                  <Check size={10} />
                </i>
              )}
            </Link>
          ))}
        </div>
        <p className="tour-instructions" id="panorama-instructions">
          Drag to look around · Pinch to zoom
          <span className="sr-only">
            . Keyboard: arrow keys to look around, plus and minus to zoom, Home
            to reset.
          </span>
        </p>
      </section>

      {showInfo && (
        <Modal
          title="A whole new perspective"
          onClose={() => setShowInfo(false)}
        >
          <div className="tour-info-symbol">
            <Scan size={37} strokeWidth={1.2} />
          </div>
          <p className="modal-description">
            Look around the entire room, from the ceiling to the floor. Drag
            with one finger, pinch to zoom, or press Play tour to enjoy a slow,
            automatic rotation.
          </p>
          <div className="detail-stat">
            <span>Your space</span>
            <strong>{room.name}</strong>
          </div>
          <div className="detail-stat">
            <span>View</span>
            <strong>360° × 180° panorama</strong>
          </div>
          <div className="detail-stat">
            <span>Design</span>
            <strong>{panorama.description}</strong>
          </div>
          <p className="fine-print">
            {room.panorama?.startsWith("/panoramas/")
              ? "These are AI-generated concept interiors, not scans of your actual room. "
              : "This tour uses the panorama selected for your space. "}
            The tour animates a panorama image. Upload your own 360° photo in
            Edit space & photos.
          </p>
          <button className="primary-button" onClick={() => setShowInfo(false)}>
            Let’s look around
            <ArrowUpRight size={17} />
          </button>
        </Modal>
      )}
    </main>
  );
}

export default function Tour() {
  const { id } = useParams();
  const { rooms } = useApp();
  const room = rooms.find((item) => item.id === id);
  if (!room || !room.panorama)
    return (
      <main className="page empty-state">
        <Compass size={36} />
        <h1>A view waiting to be discovered.</h1>
        <p>
          {room
            ? "Add a 2:1 panorama to this space to explore it in 360°."
            : "Choose one of your spaces to step inside."}
        </p>
        <Link to="/customize" className="secondary-button">
          Manage spaces & panoramas
        </Link>
        <Link to="/home" className="primary-button">
          Back to your spaces
          <ArrowUpRight size={17} />
        </Link>
      </main>
    );
  return (
    <TourExperience
      key={`${room.id}:${room.panorama}`}
      room={room}
      panorama={{
        id: room.id,
        roomType: room.type,
        image: room.panorama!,
        title: room.name,
        description: room.description,
        yaw: room.yaw ?? 0,
        pitch: room.pitch ?? -3,
        hfov: room.hfov ?? 72,
      }}
    />
  );
}
