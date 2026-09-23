import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Scan,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  collectionSchemas,
  siteSchema,
  type CollectionName,
} from "../../shared/schema";
import { useApp } from "../state/AppContext";
import type { Room } from "../data/mockData";
import Chip from "../components/Chip";
import Image from "../components/Image";
import Modal from "../components/Modal";
import RoomEditor from "../components/RoomEditor";
import UploadField from "../components/UploadField";

const catalogs: {
  key: CollectionName;
  title: string;
  description: string;
  blank: Record<string, string | number>;
}[] = [
  {
    key: "designs",
    title: "Design inspiration",
    description: "Your saved collection and discovery feed",
    blank: {
      title: "",
      category: "Living Room",
      image: "",
      roomId: "",
      tag: "YOUR INSPIRATION",
    },
  },
  {
    key: "onboardingSlides",
    title: "Welcome slides",
    description: "Photos and captions on your first screen",
    blank: {
      image: "",
      label: "MAKE ROOM FOR YOU",
      caption: "",
      detail: "",
      alt: "",
    },
  },
  {
    key: "furnishings",
    title: "Furniture",
    description: "Pieces to add to your rooms",
    blank: { name: "", material: "", image: "" },
  },
  {
    key: "decor",
    title: "Decor",
    description: "Details that make a room yours",
    blank: { name: "", description: "", image: "" },
  },
  {
    key: "lightingPresets",
    title: "Lighting presets",
    description: "Create your own brightness and glow",
    blank: {
      name: "",
      subtitle: "",
      temperature: "2700K",
      brightness: 64,
      tint: "#F5A55A",
    },
  },
  {
    key: "wallColors",
    title: "Wall colors",
    description: "Your personal paint palette",
    blank: { name: "", value: "#C8B08A" },
  },
  {
    key: "lightColors",
    title: "Light colors",
    description: "Colors for your smart-light preview",
    blank: { name: "", value: "#F2D585" },
  },
  {
    key: "members",
    title: "Project members",
    description: "Names and photos on your project card",
    blank: { name: "", image: "" },
  },
  {
    key: "notifications",
    title: "Announcements",
    description: "Messages in the notification panel",
    blank: { title: "", text: "", time: "Just now" },
  },
];
const labels: Record<string, string> = {
  name: "Name",
  title: "Title",
  category: "Category",
  image: "Photo",
  roomId: "Linked space",
  tag: "Caption tag",
  label: "Eyebrow label",
  caption: "Caption",
  detail: "Supporting text",
  alt: "Image description",
  material: "Material / details",
  description: "Description",
  subtitle: "Subtitle",
  temperature: "Color temperature",
  brightness: "Brightness (%)",
  tint: "Glow color",
  value: "Color",
  text: "Message",
  time: "Time label",
};
const siteLabels: Record<string, string> = {
  brand: "App name",
  tagline: "Brand tagline",
  welcomeHeading: "Welcome heading",
  welcomeEmphasis: "Welcome highlight",
  welcomeDescription: "Welcome description",
  moodName: "Mood card title",
  moodSubtitle: "Mood card subtitle",
  featuredRoomId: "Featured project",
};
type Item = Record<string, string | number>;

function LibraryEditor({
  collection,
  item,
  onClose,
}: {
  collection: CollectionName;
  item: Item;
  onClose: () => void;
}) {
  const { dispatch, rooms, content, notify } = useApp();
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const exists = content[collection].some((entry) => entry.id === item.id);
  const canDelete =
    ![
      "onboardingSlides",
      "decor",
      "lightingPresets",
      "wallColors",
      "lightColors",
    ].includes(collection) || content[collection].length > 1;
  async function save(event: FormEvent) {
    event.preventDefault();
    const valid = collectionSchemas[collection].safeParse(draft);
    if (!valid.success) {
      setError(
        valid.error.issues
          .map(
            (issue) =>
              `${labels[String(issue.path[0])] ?? issue.path[0]}: ${issue.message}`,
          )
          .join(" "),
      );
      return;
    }
    setSaving(true);
    setError("");
    if (
      await dispatch({ type: "collection.save", collection, item: valid.data })
    ) {
      notify("Your library has been updated");
      onClose();
    } else
      setError("This change has not been saved. Retry the connection above.");
    setSaving(false);
  }
  return (
    <Modal
      title={`${exists ? "Edit" : "Add to"} ${catalogs.find((catalog) => catalog.key === collection)?.title.toLowerCase()}`}
      onClose={busy || saving ? () => undefined : onClose}
    >
      <form onSubmit={save} className="editor-form">
        {Object.entries(draft)
          .filter(([key]) => key !== "id")
          .map(([key, value]) =>
            key === "image" ? (
              <UploadField
                key={key}
                label="Photo"
                value={String(value)}
                onChange={(image) =>
                  setDraft((current) => ({ ...current, image }))
                }
                onBusy={setBusy}
              />
            ) : (
              <label className="field-label" key={key}>
                {labels[key] ?? key}
                {key === "roomId" ? (
                  <select
                    value={value}
                    onChange={(event) =>
                      setDraft({ ...draft, [key]: event.target.value })
                    }
                  >
                    <option value="">No linked space</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      key === "tint" || key === "value"
                        ? "color"
                        : typeof value === "number"
                          ? "number"
                          : "text"
                    }
                    min={0}
                    max={100}
                    maxLength={500}
                    value={value}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [key]:
                          typeof value === "number"
                            ? Number(event.target.value)
                            : event.target.value,
                      })
                    }
                  />
                )}
              </label>
            ),
          )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy || saving}>
          {saving ? "Saving…" : "Save changes"}
          <Check size={17} />
        </button>
        {exists && canDelete && (
          <button
            className="danger-button"
            type="button"
            disabled={busy || saving}
            onClick={async () => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              setSaving(true);
              if (
                await dispatch({
                  type: "collection.delete",
                  collection,
                  id: String(item.id),
                })
              ) {
                onClose();
                notify("Item deleted");
              } else setError("This item could not be deleted.");
              setSaving(false);
            }}
          >
            <Trash2 size={16} />
            {confirmDelete ? "Confirm delete item" : "Delete item"}
          </button>
        )}
        {exists && !canDelete && (
          <p className="field-hint">
            Keep at least one item in this collection.
          </p>
        )}
      </form>
    </Modal>
  );
}

export default function Customize() {
  const { rooms, content, site, images, dispatch, notify, saveStatus } =
    useApp();
  const [tab, setTab] = useState("Spaces");
  const [roomEditor, setRoomEditor] = useState<Room | "new" | null>(null);
  const [collection, setCollection] = useState<CollectionName>("designs");
  const [item, setItem] = useState<Item | null>(null);
  const [siteDraft, setSiteDraft] = useState(site);
  const [siteError, setSiteError] = useState("");
  const [asset, setAsset] = useState<string | null>(null);
  const [assetUrl, setAssetUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const catalog = catalogs.find((entry) => entry.key === collection)!;
  const newId = () =>
    `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <main className="page customize-page page-enter">
      <header className="simple-header">
        <Link to="/home" className="icon-button" aria-label="Back to home">
          <ArrowLeft size={20} />
        </Link>
        <span>YOUR PERSONAL DESIGN STUDIO</span>
        <SlidersHorizontal size={18} />
      </header>
      <div className="collection-intro">
        <p className="eyebrow">A SPACE THAT'S ENTIRELY YOU</p>
        <h1>
          Make it your own<span>.</span>
        </h1>
        <p>Your places, your images, your details.</p>
      </div>
      <div className="studio-status">
        <span className={`status-dot ${saveStatus}`} />
        {saveStatus === "saving"
          ? "Saving to your local server…"
          : saveStatus === "error"
            ? "Some changes need your attention"
            : "Connected to your local library"}
      </div>
      <div className="filter-row studio-tabs">
        {["Spaces", "Library", "App"].map((name) => (
          <Chip
            key={name}
            active={tab === name}
            onClick={() => {
              setTab(name);
              if (name === "App") setSiteDraft(site);
            }}
          >
            {name}
          </Chip>
        ))}
      </div>
      {tab === "Spaces" && (
        <>
          <button
            className="studio-add-card"
            onClick={() => setRoomEditor("new")}
          >
            <span>
              <Plus size={25} />
            </span>
            <div>
              <strong>Add a new place</strong>
              <small>Photos, panoramas, and a story of your own</small>
            </div>
            <ArrowUpRight size={20} />
          </button>
          <div className="studio-room-list">
            {rooms.map((room) => (
              <article key={room.id} className="studio-room-card">
                <Image src={room.image} alt={room.name} />
                <div>
                  <p>
                    {room.type} · {room.status}
                  </p>
                  <h2>{room.name}</h2>
                  <span>
                    {room.panorama ? (
                      <>
                        <Scan size={13} />
                        360° view ready
                      </>
                    ) : (
                      "Add a panorama to look around"
                    )}
                  </span>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Edit ${room.name}`}
                  onClick={() => setRoomEditor(room)}
                >
                  <Pencil size={17} />
                </button>
                <Link
                  to={`/room/${room.id}`}
                  className="studio-room-open"
                  aria-label={`Open ${room.name}`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </article>
            ))}
          </div>
          {!rooms.length && (
            <p className="modal-description">
              Your library is ready for its first space.
            </p>
          )}
        </>
      )}
      {tab === "Library" && (
        <>
          <label className="field-label">
            Collection
            <select
              value={collection}
              onChange={(event) =>
                setCollection(event.target.value as CollectionName)
              }
            >
              {catalogs.map((entry) => (
                <option value={entry.key} key={entry.key}>
                  {entry.title}
                </option>
              ))}
            </select>
          </label>
          <p className="modal-description">{catalog.description}</p>
          <button
            className="secondary-button"
            onClick={() => setItem({ id: newId(), ...catalog.blank })}
          >
            <Plus size={17} />
            Add item
          </button>
          <div className="library-list">
            {content[collection].map((entry) => {
              const value = entry as unknown as Item;
              return (
                <button
                  className="library-row"
                  key={entry.id}
                  onClick={() => setItem({ ...value })}
                >
                  {value.image ? (
                    <Image src={String(value.image)} alt="" />
                  ) : (
                    <span
                      className="library-symbol"
                      style={{
                        background: String(
                          value.tint ?? value.value ?? "#40382c",
                        ),
                      }}
                    >
                      {value.tint || value.value ? "" : <ImagePlus size={19} />}
                    </span>
                  )}
                  <span>
                    <strong>
                      {value.name ?? value.title ?? value.caption}
                    </strong>
                    <small>
                      {value.material ??
                        value.category ??
                        value.subtitle ??
                        value.detail ??
                        "Edit details"}
                    </small>
                  </span>
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>
        </>
      )}
      {tab === "App" && (
        <>
          <form
            className="editor-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const valid = siteSchema.safeParse(siteDraft);
              if (!valid.success) {
                setSiteError(
                  "Please fill all titles and keep them under 100 characters.",
                );
                return;
              }
              setBusy(true);
              if (await dispatch({ type: "site.update", update: valid.data })) {
                notify("Your app has been personalized");
                setSiteError("");
              } else
                setSiteError("Unable to save. Check your server connection.");
              setBusy(false);
            }}
          >
            <h2 className="studio-section-title">
              The welcome, in your words.
            </h2>
            {Object.entries(siteDraft).map(([key, value]) => (
              <label className="field-label" key={key}>
                {siteLabels[key]}
                {key === "featuredRoomId" ? (
                  <select
                    value={value}
                    onChange={(event) =>
                      setSiteDraft({ ...siteDraft, [key]: event.target.value })
                    }
                  >
                    <option value="">First available space</option>
                    {rooms.map((room) => (
                      <option value={room.id} key={room.id}>
                        {room.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={value}
                    maxLength={key === "welcomeDescription" ? 500 : 100}
                    onChange={(event) =>
                      setSiteDraft({ ...siteDraft, [key]: event.target.value })
                    }
                  />
                )}
              </label>
            ))}
            {siteError && (
              <p className="form-error" role="alert">
                {siteError}
              </p>
            )}
            <button className="primary-button" disabled={busy}>
              {busy ? "Saving…" : "Save app details"}
              <Check size={17} />
            </button>
          </form>
          <h2 className="studio-section-title">App photography</h2>
          <p className="field-hint">
            Replace the images used for tools and default room covers. Edit
            room, profile, and welcome photos in their own sections.
          </p>
          <div className="asset-grid">
            {Object.entries(images).map(([key, image]) => (
              <button
                key={key}
                onClick={() => {
                  setAsset(key);
                  setAssetUrl(image);
                }}
              >
                <Image src={image} alt={key} />
                <span>
                  {key}
                  <Pencil size={13} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <Link className="secondary-button" to="/profile">
        Edit your profile
        <ArrowUpRight size={17} />
      </Link>
      {roomEditor && (
        <RoomEditor
          room={roomEditor === "new" ? undefined : roomEditor}
          onClose={() => setRoomEditor(null)}
        />
      )}
      {item && (
        <LibraryEditor
          collection={collection}
          item={item}
          onClose={() => setItem(null)}
        />
      )}
      {asset && (
        <Modal
          title={`Replace ${asset} image`}
          onClose={busy ? () => undefined : () => setAsset(null)}
        >
          <UploadField
            label="App photo"
            value={assetUrl}
            onChange={setAssetUrl}
            onBusy={setBusy}
          />
          <button
            className="primary-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              if (
                await dispatch({
                  type: "image.set",
                  key: asset,
                  value: assetUrl,
                })
              ) {
                setAsset(null);
                notify("Photo updated");
              }
              setBusy(false);
            }}
          >
            Save image
            <Check size={17} />
          </button>
        </Modal>
      )}
    </main>
  );
}
