import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Room } from "../data/mockData";
import Image from "./Image";

export default function ProjectCard({
  project,
  wide = false,
}: {
  project: Room;
  wide?: boolean;
}) {
  return (
    <Link
      to={`/room/${project.id}`}
      className={`project-card active:scale-95 ${wide ? "project-wide" : ""}`}
    >
      <div className="project-photo">
        <Image src={project.image} alt={project.title} />
        <span className="project-open">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="project-meta">
        <h3>{project.title}</h3>
        <p>
          <span
            className={`status-dot ${project.status === "Completed" ? "complete" : ""}`}
          />
          {project.status}
        </p>
      </div>
    </Link>
  );
}
