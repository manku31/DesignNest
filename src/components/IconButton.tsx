import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}
export default function IconButton({
  label,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`icon-button transition-transform active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
