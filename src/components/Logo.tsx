import { useApp } from "../state/AppContext";
export default function Logo({ compact = false }: { compact?: boolean }) {
  const { site } = useApp();
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <svg
        width="34"
        height="40"
        viewBox="0 0 34 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 36V15L17 4l14 11v21H3Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M8 36V18l9-7 9 7v18M13 36V21l4-3 4 3v15"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        <strong>
          {site.brand}
          <span className="brand-period">.</span>
        </strong>
        <small>{site.tagline}</small>
      </span>
    </div>
  );
}
