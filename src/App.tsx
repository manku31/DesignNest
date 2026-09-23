import { lazy, Suspense, useEffect, useRef } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BottomNav from "./components/BottomNav";
import Logo from "./components/Logo";
import Toast from "./components/Toast";
import { AppProvider, useApp } from "./state/AppContext";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import RoomDetail from "./pages/RoomDetail";
import SmartLight from "./pages/SmartLight";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Customize from "./pages/Customize";

const Tour = lazy(() => import("./pages/Tour"));

function AppShell() {
  const { pathname } = useLocation();
  const { site, saveStatus, saveError, retrySave } = useApp();
  const scrollArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollArea.current?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
    const title =
      pathname === "/"
        ? "A space that’s you"
        : pathname.startsWith("/room")
          ? "Your space"
          : pathname.startsWith("/tour/")
            ? "360° Studio"
            : pathname === "/light"
              ? "Smart Light"
              : pathname
                  .slice(1)
                  .replace(/^./, (letter) => letter.toUpperCase());
    document.title = `${title} — ${site.brand} ${site.tagline}`;
  }, [pathname, site.brand, site.tagline]);
  return (
    <div className="desktop-stage">
      <div className="desktop-wordmark" aria-hidden="true">
        <Logo compact />
        <span>
          CONSIDERED SPACES.
          <br />
          MEANINGFUL LIVING.
        </span>
      </div>
      <div
        className={`app-frame ${pathname === "/" ? "onboarding-frame" : ""}`}
      >
        <div className="app-scroll no-scrollbar" ref={scrollArea}>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/room/:id" element={<RoomDetail key={pathname} />} />
            <Route
              path="/tour/:id"
              element={
                <Suspense
                  fallback={
                    <main className="tour-route-loading" role="status">
                      Opening your 360° space…
                    </main>
                  }
                >
                  <Tour />
                </Suspense>
              }
            />
            <Route path="/light" element={<SmartLight />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="*"
              element={
                <main className="page empty-state">
                  <Logo />
                  <h1>Let’s bring you home.</h1>
                  <p>This corner is still waiting to be designed.</p>
                  <Link to="/home" className="primary-button">
                    Back to your spaces
                    <ArrowRight size={18} />
                  </Link>
                </main>
              }
            />
          </Routes>
        </div>
        {saveStatus === "error" && (
          <div className="save-banner" role="alert">
            <p>Changes haven’t been saved. {saveError}</p>
            <button onClick={retrySave}>Retry saving</button>
          </div>
        )}
        <BottomNav />
        <Toast />
      </div>
      <div className="desktop-note" aria-hidden="true">
        <span className="desktop-note-line" />
        <p>
          THE ART OF
          <br />
          <span>FEELING AT HOME.</span>
        </p>
        <small>DESIGNNEST INTERIORS © 2026</small>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
