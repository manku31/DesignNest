import { useId, useState } from "react";
import { ImagePlus, LoaderCircle, Scan, X } from "lucide-react";
import { api } from "../state/AppContext";
import Image from "./Image";

export default function UploadField({
  label,
  value,
  onChange,
  panorama = false,
  onBusy,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  panorama?: boolean;
  onBusy?: (busy: boolean) => void;
  optional?: boolean;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className={`upload-field ${panorama ? "panorama-upload" : ""}`}>
      <div className="upload-heading">
        <span>{label}</span>
        {value && optional && (
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove ${label.toLowerCase()}`}
            onClick={() => onChange("")}
            disabled={busy}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="upload-preview">
        {value ? (
          <Image src={value} alt={`${label} preview`} />
        ) : (
          <div className="upload-placeholder">
            {panorama ? (
              <Scan size={28} strokeWidth={1.3} />
            ) : (
              <ImagePlus size={28} strokeWidth={1.3} />
            )}
            <span>
              {panorama ? "Your space. Every angle." : "Make it your own."}
            </span>
          </div>
        )}
        <label className="upload-button" htmlFor={id}>
          {busy ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <ImagePlus size={17} />
          )}
          {busy ? "Uploading…" : value ? "Replace image" : "Choose an image"}
        </label>
        <input
          id={id}
          className="upload-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={label}
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setError("");
            if (file.size > 25 * 1024 * 1024) {
              setError("Choose an image smaller than 25 MB.");
              return;
            }
            setBusy(true);
            onBusy?.(true);
            try {
              const body = new FormData();
              body.append("kind", panorama ? "panorama" : "photo");
              body.append("image", file);
              const uploaded = await api<{ url: string }>("/api/uploads", {
                method: "POST",
                body,
              });
              onChange(uploaded.url);
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Upload failed. Please try again.",
              );
            } finally {
              setBusy(false);
              onBusy?.(false);
            }
          }}
        />
      </div>
      <p className="field-hint">
        {panorama
          ? "A full 360° photo in 2:1 format, at least 1024 × 512 px."
          : "JPEG, PNG, or WebP. Up to 25 MB."}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
