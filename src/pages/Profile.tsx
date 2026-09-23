import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import UploadField from "../components/UploadField";
import { useApp } from "../state/AppContext";
import Chip from "../components/Chip";
import GlassCard from "../components/GlassCard";
import Image from "../components/Image";
import Logo from "../components/Logo";
import Modal from "../components/Modal";

export default function Profile() {
  const {
    user,
    updateUser,
    favorites,
    rooms,
    notify,
    preferences,
    updatePreferences,
  } = useApp();
  const [sheet, setSheet] = useState<
    "edit" | "preferences" | "notifications" | "privacy" | "help" | null
  >(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.location);
  const style = preferences.style;
  const setStyle = (style: string) => updatePreferences({ style });
  const [avatar, setAvatar] = useState(user.avatar);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const updates = preferences;
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const saved = await updateUser({
      name: name.trim(),
      email: email.trim(),
      location: location.trim(),
      avatar,
    });
    setBusy(false);
    if (!saved) {
      setError("Your profile could not be saved. Retry your connection.");
      return;
    }
    setSheet(null);
    notify("Looking good. Your profile is updated.");
  }
  const settings = [
    {
      id: "preferences" as const,
      icon: SlidersHorizontal,
      title: "Design preferences",
      text: style,
    },
    {
      id: "notifications" as const,
      icon: Bell,
      title: "Notifications",
      text: "The updates that matter to you",
    },
    {
      id: "privacy" as const,
      icon: ShieldCheck,
      title: "Privacy & your data",
      text: "Your space. Your peace of mind.",
    },
    {
      id: "help" as const,
      icon: HelpCircle,
      title: "A little help",
      text: "We’re here for you",
    },
  ];
  return (
    <main className="page profile-page page-enter">
      <header className="simple-header">
        <Link to="/home" className="icon-button" aria-label="Back to home">
          <ArrowLeft size={20} />
        </Link>
        <span>A HOME FOR YOUR IDEAS</span>
        <Sparkles size={18} />
      </header>
      <section className="profile-card">
        <div className="profile-avatar">
          <Image src={user.avatar} alt={user.name} />
          <span>
            <Check size={12} />
          </span>
        </div>
        <p className="eyebrow">THE CREATIVE BEHIND THE SPACE</p>
        <h1>
          {user.name}
          <span>.</span>
        </h1>
        <p className="profile-location">
          <MapPin size={13} />
          {user.location}
        </p>
        <button
          className="edit-profile-button"
          onClick={() => {
            setName(user.name);
            setEmail(user.email);
            setLocation(user.location);
            setAvatar(user.avatar);
            setError("");
            setSheet("edit");
          }}
        >
          Edit profile
          <Pencil size={13} />
        </button>
      </section>
      <GlassCard className="profile-stats">
        <Link to="/projects">
          <strong>{rooms.length}</strong>
          <span>Projects</span>
        </Link>
        <Link to="/favorites">
          <strong>{favorites.length}</strong>
          <span>Saved</span>
        </Link>
        <Link to="/projects">
          <strong>{rooms.length}</strong>
          <span>Rooms</span>
        </Link>
      </GlassCard>
      <Link to="/favorites?view=discover" className="profile-inspiration">
        <span className="inspiration-spark">
          <Sparkles size={23} strokeWidth={1.2} />
        </span>
        <div>
          <h2>Your next idea is waiting.</h2>
          <p>Find something that feels like you.</p>
        </div>
        <ArrowRight size={19} />
      </Link>
      <div className="profile-settings">
        <p className="eyebrow">A FEW THINGS, JUST FOR YOU</p>
        {settings.map(({ id, icon: Icon, title, text }) => (
          <button
            key={id}
            onClick={() => setSheet(id)}
            className="settings-row"
          >
            <span className="settings-icon">
              <Icon size={19} strokeWidth={1.5} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
      <Link to="/customize" className="customize-link">
        <SlidersHorizontal size={20} />
        <span>
          Customize your world
          <small>Places, uploads, content, and app details</small>
        </span>
        <ArrowRight size={18} />
      </Link>
      <footer className="profile-footer">
        <Logo compact />
        <p>A little more considered. A little more you.</p>
        <span>DESIGNNEST INTERIORS · VERSION 1.0</span>
      </footer>
      {sheet === "edit" && (
        <Modal
          title="Hello, you"
          onClose={busy ? () => undefined : () => setSheet(null)}
        >
          <form onSubmit={saveProfile}>
            <p className="modal-description">
              A few details to make yourself at home.
            </p>
            <label className="field-label">
              Your name
              <input
                required
                maxLength={50}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="field-label">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field-label">
              Location
              <input
                required
                maxLength={60}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>
            <UploadField
              label="Profile photo"
              value={avatar}
              onChange={setAvatar}
              onBusy={setBusy}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="primary-button" disabled={busy}>
              Save your details
              <Check size={18} />
            </button>
          </form>
        </Modal>
      )}
      {sheet === "preferences" && (
        <Modal title="What feels like home?" onClose={() => setSheet(null)}>
          <p className="modal-description">
            Choose the design direction that speaks to you.
          </p>
          <div className="preference-chips">
            {[
              "Warm minimalism",
              "Organic modern",
              "Quiet luxury",
              "Scandinavian",
              "Eclectic soul",
              "Modern classic",
            ].map((item) => (
              <Chip
                active={style === item}
                key={item}
                onClick={() => setStyle(item)}
              >
                {item}
              </Chip>
            ))}
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setSheet(null);
              notify("Your design preferences are updated");
            }}
          >
            That feels like me
            <Heart size={17} />
          </button>
        </Modal>
      )}
      {sheet === "notifications" && (
        <Modal title="Just the right amount" onClose={() => setSheet(null)}>
          <p className="modal-description">
            Choose the updates you’d like to see.
          </p>
          {[
            {
              key: "projects" as const,
              title: "Project updates",
              text: "New ideas and progress from your team",
            },
            {
              key: "inspiration" as const,
              title: "A little inspiration",
              text: "Fresh spaces and curated collections",
            },
            {
              key: "reminders" as const,
              title: "Gentle reminders",
              text: "Keep your creative plans moving",
            },
          ].map(({ key, title, text }) => (
            <div className="notification-setting" key={key}>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
              <button
                role="switch"
                aria-checked={updates[key]}
                aria-label={title}
                className={`toggle-switch ${updates[key] ? "on" : ""}`}
                onClick={() => updatePreferences({ [key]: !updates[key] })}
              >
                <span />
              </button>
            </div>
          ))}
          <button
            className="primary-button"
            onClick={() => {
              setSheet(null);
              notify("Your notification preferences are saved");
            }}
          >
            All set
            <Check size={18} />
          </button>
        </Modal>
      )}
      {sheet === "privacy" && (
        <Modal title="Your space stays yours" onClose={() => setSheet(null)}>
          <span className="privacy-icon">
            <ShieldCheck size={32} strokeWidth={1.2} />
          </span>
          <p className="modal-description">
            Your spaces, profile, favorites, and design settings are saved on
            your local DesignNest server. They stay available when you refresh
            or open the app on another device.
          </p>
          <div className="privacy-note">
            <Check size={16} />
            <span>No account or sign-in required</span>
          </div>
          <div className="privacy-note">
            <Check size={16} />
            <span>Your photos and panoramas stay on your server</span>
          </div>
          <p className="fine-print">
            This shared local workspace is available to devices that can reach
            your server. Keep a backup of its data folder. The Inter typeface
            loads from Google Fonts.
          </p>
          <button className="primary-button" onClick={() => setSheet(null)}>
            Peace of mind
            <Check size={17} />
          </button>
        </Modal>
      )}
      {sheet === "help" && (
        <Modal title="A little guidance" onClose={() => setSheet(null)}>
          <div className="help-list">
            <details open>
              <summary>How do I create a new space?</summary>
              <p>
                Head to Home and tap Add Space. Give your space a name, choose a
                room type, and start making it your own.
              </p>
            </details>
            <details>
              <summary>How do I save a design?</summary>
              <p>
                Tap the heart on a room or inspiration card. You’ll find
                everything you save in your Favorites collection.
              </p>
            </details>
            <details>
              <summary>Can I control real lights?</summary>
              <p>
                This is an interactive preview. Brightness, colors, and
                schedules show how your future connected home could feel.
              </p>
            </details>
            <details>
              <summary>What does the visualizer show?</summary>
              <p>
                It previews your room photo with different visual moods. Full 3D
                room planning is coming in a future version.
              </p>
            </details>
          </div>
          <div className="demo-note">
            <Mail size={18} />
            <p>
              More thoughtful features are on their way. For now, make yourself
              at home.
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
