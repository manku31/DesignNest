import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({
  title,
  to,
  onClick,
  label = "See all",
}: {
  title: string;
  to?: string;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to ? (
        <Link to={to}>
          {label}
          <ArrowUpRight size={13} />
        </Link>
      ) : onClick ? (
        <button onClick={onClick}>
          {label}
          <ArrowUpRight size={13} />
        </button>
      ) : null}
    </div>
  );
}
