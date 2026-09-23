import { ClipboardList, Heart, House, UserRound } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", icon: House },
  { to: "/projects", label: "Projects", icon: ClipboardList },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname.startsWith("/tour/")) return null;
  return (
    <div className="nav-position pb-[env(safe-area-inset-bottom)]">
      <nav className="bottom-nav" aria-label="Main navigation">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive || (to === "/home" && (pathname.startsWith("/room") || pathname === "/light")) ? "nav-active" : ""}`
            }
          >
            <Icon size={20} strokeWidth={1.7} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
