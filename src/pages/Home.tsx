import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  MoreHorizontal,
  Plus,
  Sparkles,
  Box,
  Layers,
  Clock3,
  Scan,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { RoomType } from "../data/mockData";
import RoomEditor from "../components/RoomEditor";
import { useApp } from "../state/AppContext";
import AvatarStack from "../components/AvatarStack";
import Chip from "../components/Chip";
import IconButton from "../components/IconButton";
import Image from "../components/Image";
import Modal from "../components/Modal";
import Pendant from "../components/Pendant";
import ProjectCard from "../components/ProjectCard";
import SectionHeader from "../components/SectionHeader";
import SpaceTile from "../components/SpaceTile"; 

export default function Home() {
  const {
    user,
    rooms,
    images,
    content: { notifications },
    site,
    preferences,
    updatePreferences,
    setDirection,
    notify,
  } = useApp();
  const featured =
    rooms.find((room) => room.id === site.featuredRoomId) ?? rooms[0];
  const tourRoom = rooms.find((room) => room.panorama);
  const [filter, setFilter] = useState<RoomType>("Living Room");
  const [sheet, setSheet] = useState<
    "notifications" | "add" | "spaces" | "project" | "visualizer" | null
  >(null);
  const read = preferences.notificationsRead;
  const setRead = (notificationsRead: boolean) =>
    updatePreferences({ notificationsRead });
  const [visualStyle, setVisualStyle] = useState("Warm Minimal");
  const [visualRoom, setVisualRoom] = useState(rooms[0]?.id ?? "");
  const selectedRoom = rooms.find((room) => room.id === visualRoom) ?? rooms[0];
  const filteredRooms = [...rooms].sort(
    (a, b) => Number(b.type === filter) - Number(a.type === filter),
  );

  return (
    <main className="page home-page page-enter">
      <header className="home-header">
        <Link to="/profile" className="profile-greeting">
          <Image src={user.avatar} alt="Your profile" />
          <div>
            <span>Welcome back,</span>
            <h1>
              {user.name}
              <span className="greeting-dot">.</span>
            </h1>
          </div>
        </Link>
        <IconButton
          label="Open notifications"
          onClick={() => setSheet("notifications")}
          className="notification-button"
        >
          <Bell size={20} strokeWidth={1.5} />
          {!read && <span className="notification-dot" />}
        </IconButton>
      </header>
      {featured && (
        <section
          className="featured-grid"
          aria-label="Your current project and mood"
        >
          <div className="current-project">
            <div className="project-card-top">
              <span>
                <span className="tiny-dot" />
                MY PROJECT
              </span>
              <IconButton
                label="Project options"
                onClick={() => setSheet("project")}
              >
                <MoreHorizontal size={19} />
              </IconButton>
            </div>
            <Link to={`/room/${featured?.id}`} className="current-project-link">
              <h2>{featured.title}</h2>
              <div className="current-project-bottom">
                <AvatarStack />
                <span className="round-arrow">
                  <ArrowUpRight size={19} />
                </span>
              </div>
            </Link>
            <div className="project-decoration" />
          </div>
          <Link to="/light" className="mood-card active:scale-95">
            <span className="mood-eyebrow">SET THE MOOD</span>
            <Pendant variant="pleated" />
            <div className="mood-caption">
              <h3>{site.moodName}</h3>
              <span>
                <span className="tiny-dot" />
                {site.moodSubtitle}
                <ArrowUpRight size={12} />
              </span>
            </div>
          </Link>
        </section>
      )}
      <section className="home-section">
        <SectionHeader title="My Spaces" onClick={() => setSheet("spaces")} />
        <div className="space-grid">
          {rooms.slice(0, 3).map((room) => (
            <SpaceTile key={room.id} room={room} />
          ))}
          <SpaceTile onAdd={() => setSheet("add")} />
        </div>
      </section>
      <section className="home-section">
        <SectionHeader title="Quick Tools" />
        <div className="quick-tools" aria-label="Quick Tools">
          <Link
            className="tool-card ideas-tool active:scale-95"
            to="/favorites?view=discover"
          >
            <div className="tool-top">
              <Sparkles size={16} />
              <span>GET INSPIRED</span>
            </div>
            <h3>Design Ideas</h3>
            <p>
              Inspiration for your
              <br />
              dream space.
            </p>
            <span className="tool-arrow">
              <ArrowUpRight size={17} />
            </span>
            <Image
              src={images.chair}
              alt="Sculptural upholstered accent chair"
            />
          </Link>
          <button
            className="tool-card visualizer-tool active:scale-95"
            onClick={() => setSheet("visualizer")}
            disabled={!rooms.length}
          >
            <div className="tool-top">
              <Box size={16} />
              <span>MAKE IT REAL</span>
            </div>
            <h3>3D Visualizer</h3>
            <p>
              See your space
              <br />
              come to life.
            </p>
            <span className="tool-arrow">
              <ArrowUpRight size={17} />
            </span>
            <div className="mini-room" aria-hidden="true">
              <div className="mini-wall back" />
              <div className="mini-wall side" />
              <div className="mini-floor" />
              <div className="mini-rug" />
              <div className="mini-sofa" />
              <div className="mini-table" />
              <div className="mini-plant" />
            </div>
          </button>
        </div>
      </section>
      <section className="home-section recent-section">
        <SectionHeader title="Recent Projects" to="/projects" />
        <div className="project-scroll no-scrollbar snap-x">
          {filteredRooms.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="filter-row no-scrollbar snap-x">
          {[...new Set(rooms.map((room) => room.type))].map((name) => (
            <Chip
              key={name}
              active={name === filter}
              onClick={() => setFilter(name)}
            >
              {name}
            </Chip>
          ))}
        </div>
      </section>
      {tourRoom && (
        <Link
          to={`/tour/${tourRoom.id}`}
          className="tour-discovery-card active:scale-95"
          aria-label="Open 360 degree Studio"
        >
          <Image src={tourRoom.panorama!} alt={`${tourRoom.name} panorama`} />
          <div className="tour-discovery-shade" />
          <span className="tour-discovery-label">
            <Scan size={15} />
            NEW PERSPECTIVES
          </span>
          <div>
            <h2>
              Step inside your space<span>.</span>
            </h2>
            <p>Your places. Every angle. Entirely yours.</p>
          </div>
          <span className="tour-discovery-action">
            Explore 360° Studio
            <span>
              <ArrowUpRight size={19} />
            </span>
          </span>
        </Link>
      )}
      <Link to="/customize" className="customize-link">
        <SlidersHorizontal size={20} />
        <span>
          Customize your world
          <small>Add places, upload photos, make it yours</small>
        </span>
        <ArrowUpRight size={18} />
      </Link>
      <p className="page-signoff">THOUGHTFULLY DESIGNED. BEAUTIFULLY YOU.</p>

      {sheet === "notifications" && (
        <Modal title="Your little updates" onClose={() => setSheet(null)}>
          <div className="notification-list">
            {notifications.map((item) => (
              <div
                key={item.title}
                className={`notification-item ${read ? "is-read" : ""}`}
              >
                <span className="notification-symbol">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <small>{item.time}</small>
                </div>
                {!read && <i />}
              </div>
            ))}
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setRead(true);
              notify("You’re all caught up");
            }}
          >
            {read ? (
              <>
                <Check size={17} />
                All caught up
              </>
            ) : (
              "Mark all as read"
            )}
          </button>
        </Modal>
      )}
      {sheet === "project" && (
        <Modal
          title={featured?.title ?? "Your projects"}
          onClose={() => setSheet(null)}
        >
          <p className="modal-description">
            Warm minimalism, natural textures, and room for the moments that
            matter.
          </p>
          <div className="project-summary">
            <span>
              <Clock3 size={18} />
              In progress
            </span>
            <AvatarStack />
          </div>
          <Link className="primary-button" to={`/room/${featured?.id}`}>
            Continue your project
            <ArrowRight size={18} />
          </Link>
          <Link className="secondary-button" to="/projects">
            View all projects
          </Link>
        </Modal>
      )}
      {sheet === "spaces" && (
        <Modal title="A place for everything" onClose={() => setSheet(null)}>
          <p className="modal-description">
            Your spaces, each with their own story.
          </p>
          <div className="all-spaces">
            {rooms.map((room) => (
              <Link key={room.id} to={`/room/${room.id}`}>
                <Image src={room.image} alt={room.name} />
                <span>
                  {room.name}
                  <small>{room.status}</small>
                </span>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
          <button className="primary-button" onClick={() => setSheet("add")}>
            <Plus size={18} />
            Add a new space
          </button>
        </Modal>
      )}
      {sheet === "add" && <RoomEditor onClose={() => setSheet(null)} />}
      {sheet === "visualizer" && selectedRoom && (
        <Modal title="Picture the possibilities" onClose={() => setSheet(null)}>
          <p className="modal-description">
            Explore a style preview for your space.
          </p>
          <div
            className={`visualizer-preview style-${visualStyle.replace(" ", "-").toLowerCase()}`}
          >
            <Image
              src={selectedRoom.image}
              alt={`${visualStyle} style preview of ${selectedRoom.name}`}
            />
            <span>
              <Layers size={14} />
              {visualStyle} · Style preview
            </span>
          </div>
          <label className="field-label">
            Your space
            <select
              value={visualRoom}
              onChange={(event) => setVisualRoom(event.target.value)}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>
          <div className="filter-row">
            {["Warm Minimal", "Soft Natural", "Modern Noir"].map((style) => (
              <Chip
                active={visualStyle === style}
                key={style}
                onClick={() => setVisualStyle(style)}
              >
                {style}
              </Chip>
            ))}
          </div>
          <p className="fine-print">
            A curated photo preview. Full 3D room planning is coming soon.
          </p>
          {selectedRoom.panorama && (
            <Link className="secondary-button" to={`/tour/${visualRoom}`}>
              <Scan size={17} />
              Step inside in 360°
              <ArrowUpRight size={17} />
            </Link>
          )}
          <button
            className="primary-button"
            onClick={() => {
              setDirection(selectedRoom.id, visualStyle);
              setSheet(null);
              notify(`${visualStyle} saved to ${selectedRoom.name}`);
            }}
          >
            Save this direction
            <Check size={17} />
          </button>
        </Modal>
      )}
    </main>
  );
}
