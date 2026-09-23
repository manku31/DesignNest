import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Room } from "../data/mockData";
import type { Action, AppData } from "../../shared/schema";
import { applyAction } from "../../shared/state";

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.json().catch(() => {
    throw new Error(
      "The local server is unavailable. Start it with npm run dev.",
    );
  });
  if (!response.ok)
    throw new RequestError(
      body.error || "The request could not be saved.",
      response.status,
    );
  return body;
}
type LightState = AppData["lights"][string];
interface AppState extends AppData {
  dispatch: (action: Action) => Promise<boolean>;
  toggleFavorite: (id: string) => void;
  addRoom: (room: Room) => Promise<boolean>;
  updateLight: (id: string, update: Partial<LightState>) => void;
  updateUser: (update: Partial<AppData["user"]>) => Promise<boolean>;
  setDirection: (id: string, value: string) => void;
  updateRoomSettings: (
    id: string,
    update: Partial<AppData["roomSettings"][string]>,
  ) => void;
  updatePreferences: (update: Partial<AppData["preferences"]>) => void;
  toast: string;
  notify: (message: string) => void;
  saveStatus: "saved" | "saving" | "error";
  saveError: string;
  retrySave: () => void;
}
const AppContext = createContext<AppState | null>(null);
type Pending = { action: Action; resolve: (saved: boolean) => void };

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const latest = useRef<AppData | null>(null);
  const pending = useRef<Pending[]>([]);
  const processing = useRef(false);
  const [loadError, setLoadError] = useState("");
  const [toast, notify] = useState("");
  const [saveStatus, setSaveStatus] = useState<AppState["saveStatus"]>("saved");
  const [saveError, setSaveError] = useState("");
  const paint = useCallback(() => {
    if (!latest.current) return;
    setData(
      pending.current.reduce(
        (state, item) => applyAction(state, item.action),
        latest.current,
      ),
    );
  }, []);
  const load = useCallback(async () => {
    try {
      const state = await api<AppData>("/api/state");
      if (!latest.current || state.revision > latest.current.revision) {
        latest.current = state;
        paint();
      }
      setLoadError("");
    } catch (error) {
      if (!latest.current)
        setLoadError(
          error instanceof Error
            ? error.message
            : "Cannot connect to your local server.",
        );
    }
  }, [paint]);
  useEffect(() => {
    void load();
    const refresh = () => {
      if (!document.hidden && !pending.current.length && !processing.current)
        void load();
    };
    const interval = window.setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);
  const flush = useCallback(async () => {
    if (processing.current) return;
    processing.current = true;
    setSaveStatus("saving");
    setSaveError("");
    while (pending.current.length) {
      const item = pending.current[0];
      try {
        latest.current = await api<AppData>("/api/actions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.action),
        });
        pending.current.shift();
        paint();
        item.resolve(true);
      } catch (error) {
        if (
          error instanceof RequestError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          pending.current.shift();
          paint();
          item.resolve(false);
          notify(error.message);
          continue;
        }
        setSaveStatus("error");
        setSaveError(
          error instanceof Error
            ? error.message
            : "Your changes have not been saved.",
        );
        pending.current.forEach((entry) => entry.resolve(false));
        processing.current = false;
        return;
      }
    }
    processing.current = false;
    setSaveStatus("saved");
  }, [paint]);
  const dispatch = useCallback(
    (action: Action) =>
      new Promise<boolean>((resolve) => {
        pending.current.push({ action, resolve });
        paint();
        void flush();
      }),
    [paint, flush],
  );
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (pending.current.length) event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);
  if (!data)
    return (
      <main className="connection-screen">
        <div className="connection-orbit" />
        <h1>
          {loadError
            ? "Your server is taking a moment."
            : "Opening your spaces…"}
        </h1>
        <p>{loadError || "Connecting to your local DesignNest library."}</p>
        {loadError && (
          <button className="primary-button" onClick={() => void load()}>
            Try again
          </button>
        )}
      </main>
    );
  return (
    <AppContext.Provider
      value={{
        ...data,
        dispatch,
        toast,
        notify,
        saveStatus,
        saveError,
        retrySave: () => void flush(),
        toggleFavorite: (id) => {
          void dispatch({
            type: "favorite.set",
            id,
            saved: !data.favorites.includes(id),
          });
        },
        addRoom: (room) => dispatch({ type: "room.save", room }),
        updateLight: (id, update) => {
          void dispatch({ type: "light.update", id, update });
        },
        updateUser: (update) => dispatch({ type: "profile.update", update }),
        setDirection: (id, value) => {
          void dispatch({ type: "direction.set", id, value });
        },
        updateRoomSettings: (id, update) => {
          void dispatch({ type: "roomSettings.update", id, update });
        },
        updatePreferences: (update) => {
          void dispatch({ type: "preferences.update", update });
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
