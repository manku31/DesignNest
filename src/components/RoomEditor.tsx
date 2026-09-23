import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Room } from "../data/mockData";
import { useApp } from "../state/AppContext";
import Modal from "./Modal";
import UploadField from "./UploadField";

export default function RoomEditor({
  room,
  onClose,
}: {
  room?: Room;
  onClose: () => void;
}) {
  const { dispatch, images, notify } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Room>(
    room ?? {
      id: `space-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      name: "",
      title: "",
      type: "Living Room",
      image: images.lounge,
      description: "",
      status: "In Progress",
      panorama: "",
      gallery: [],
      yaw: 0,
      pitch: -3,
      hfov: 72,
    },
  );
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const change = (update: Partial<Room>) =>
    setDraft((current) => ({ ...current, ...update }));
  const busy = (active: boolean) =>
    setUploads((count) => count + (active ? 1 : -1));
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const success = await dispatch({
      type: "room.save",
      room: { ...draft, title: draft.title.trim() || draft.name.trim() },
    });
    setSaving(false);
    if (!success) {
      setError(
        "Your space could not be saved. Check the connection message and retry.",
      );
      return;
    }
    notify(room ? "Your space has been updated" : "Your new space is ready");
    onClose();
    navigate(`/room/${draft.id}`);
  }
  return (
    <Modal
      title={room ? "Make it yours" : "Make room for something new"}
      onClose={saving || uploads ? () => undefined : onClose}
    >
      <form onSubmit={save} className="editor-form">
        <p className="modal-description">
          Your place, your photos, your point of view.
        </p>
        <label className="field-label">
          Space name
          <input
            required
            maxLength={100}
            placeholder="e.g. My reading nook"
            value={draft.name}
            onChange={(event) => change({ name: event.target.value })}
          />
        </label>
        <label className="field-label">
          Project title
          <input
            maxLength={100}
            placeholder={draft.name || "A name for your project"}
            value={draft.title}
            onChange={(event) => change({ title: event.target.value })}
          />
        </label>
        <div className="editor-two-columns">
          <label className="field-label">
            Room type
            <input
              required
              list="room-types"
              maxLength={100}
              value={draft.type}
              onChange={(event) => change({ type: event.target.value })}
            />
            <datalist id="room-types">
              {[
                "Living Room",
                "Bedroom",
                "Kitchen",
                "Dining Room",
                "Office",
                "Bathroom",
                "Outdoor",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </datalist>
          </label>
          <label className="field-label">
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                change({ status: event.target.value as Room["status"] })
              }
            >
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
        </div>
        <label className="field-label">
          Description
          <textarea
            maxLength={500}
            rows={3}
            placeholder="Tell the story of this space…"
            value={draft.description}
            onChange={(event) => change({ description: event.target.value })}
          />
        </label>
        <UploadField
          label="Cover photo"
          value={draft.image}
          onChange={(image) => change({ image })}
          onBusy={busy}
        />
        <UploadField
          label="360° panorama"
          value={draft.panorama ?? ""}
          onChange={(panorama) => change({ panorama })}
          panorama
          optional
          onBusy={busy}
        />
        {draft.panorama && (
          <details className="editor-details">
            <summary>Set the starting view</summary>
            <p className="field-hint">Choose where your 360° tour opens.</p>
            {(
              [
                ["yaw", "Horizontal angle", -180, 180],
                ["pitch", "Vertical angle", -85, 85],
                ["hfov", "Field of view", 40, 95],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="field-label">
                {label} · {draft[key] ?? (key === "hfov" ? 72 : 0)}°
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={draft[key] ?? (key === "hfov" ? 72 : 0)}
                  onChange={(event) =>
                    change({ [key]: Number(event.target.value) })
                  }
                />
              </label>
            ))}
          </details>
        )}
        <div className="editor-section-heading">
          <h3>Photo gallery</h3>
          <span>{draft.gallery?.length ?? 0} / 20</span>
        </div>
        {(draft.gallery ?? []).map((image, index) => (
          <div className="gallery-editor-item" key={index}>
            <UploadField
              label={`Gallery photo ${index + 1}`}
              value={image}
              onBusy={busy}
              onChange={(url) =>
                change({
                  gallery: draft.gallery?.map((value, i) =>
                    i === index ? url : value,
                  ),
                })
              }
            />
            <button
              type="button"
              className="secondary-button"
              disabled={!!uploads}
              onClick={() =>
                change({
                  gallery: draft.gallery?.filter((_, i) => i !== index),
                })
              }
            >
              Remove gallery photo {index + 1}
            </button>
          </div>
        ))}
        {(draft.gallery?.length ?? 0) < 20 && (
          <button
            className="secondary-button"
            type="button"
            disabled={!!uploads}
            onClick={() => change({ gallery: [...(draft.gallery ?? []), ""] })}
          >
            <Plus size={17} />
            Add gallery photo
          </button>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary-button"
          disabled={saving || !!uploads}
          type="submit"
        >
          {saving ? "Saving…" : room ? "Save space" : "Create your space"}
          {room ? <Check size={18} /> : <ArrowRight size={18} />}
        </button>
        {room && (
          <div className="delete-space">
            {deleting ? (
              <>
                <p>
                  Delete {room.name} and its saved settings? The uploaded files
                  remain on your server.
                </p>
                <button
                  className="danger-button"
                  type="button"
                  disabled={saving || !!uploads}
                  onClick={async () => {
                    setSaving(true);
                    if (await dispatch({ type: "room.delete", id: room.id })) {
                      onClose();
                      navigate("/customize");
                      notify("Space deleted");
                    } else setError("The space could not be deleted.");
                    setSaving(false);
                  }}
                >
                  Confirm delete
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setDeleting(false)}
                >
                  Keep this space
                </button>
              </>
            ) : (
              <button
                className="danger-button"
                type="button"
                onClick={() => setDeleting(true)}
              >
                <Trash2 size={16} />
                Delete space
              </button>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
