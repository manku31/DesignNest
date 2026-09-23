import type { ButtonHTMLAttributes } from "react";

export default function Chip({
  active = false,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`chip ${active ? "is-active" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
