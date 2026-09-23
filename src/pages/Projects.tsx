import { useState } from "react";
import {
  ArrowLeft,
  Search,
  LayoutGrid,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppContext";
import Chip from "../components/Chip";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const { rooms } = useApp();
  const [filter, setFilter] = useState("All projects");
  const [search, setSearch] = useState("");
  const visible = rooms.filter(
    (room) =>
      (filter === "All projects" || room.status === filter) &&
      room.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="page collection-page page-enter">
      <header className="simple-header">
        <Link to="/home" className="icon-button" aria-label="Back to home">
          <ArrowLeft size={20} />
        </Link>
        <span>YOUR CREATIVE JOURNEY</span>
        <LayoutGrid size={18} />
      </header>
      <div className="collection-intro">
        <p className="eyebrow">FROM AN IDEA TO A FEELING</p>
        <h1>
          Spaces in the making<span>.</span>
        </h1>
        <p>A little closer to the home you imagine.</p>
      </div>
      <Link className="secondary-button" to="/customize">
        <Plus size={17} />
        Manage your spaces
      </Link>
      <label className="search-field">
        <Search size={18} />
        <input
          aria-label="Search projects"
          placeholder="Find your space"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SlidersHorizontal size={16} />
      </label>
      <div className="filter-row no-scrollbar">
        {["All projects", "In Progress", "Completed"].map((item) => (
          <Chip
            key={item}
            active={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </Chip>
        ))}
      </div>
      <div className="collection-count">
        <span>
          {visible.length} {visible.length === 1 ? "space" : "spaces"}
        </span>
        <span>MADE WITH INTENTION</span>
      </div>
      <div className="projects-list">
        {visible.map((room) => (
          <ProjectCard key={room.id} project={room} wide />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <Search size={30} />
          <h2>No spaces found</h2>
          <p>Try a different name or project filter.</p>
          <button
            className="secondary-button"
            onClick={() => {
              setSearch("");
              setFilter("All projects");
            }}
          >
            Show all projects
          </button>
        </div>
      )}
    </main>
  );
}
