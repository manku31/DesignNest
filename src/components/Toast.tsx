import { useEffect } from "react";
import { Check } from "lucide-react";
import { useApp } from "../state/AppContext";

export default function Toast() {
  const { toast, notify } = useApp();
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => notify(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast, notify]);
  return (
    <div
      className={`toast ${toast ? "toast-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {toast && (
        <>
          <Check size={16} />
          <span>{toast}</span>
        </>
      )}
    </div>
  );
}
