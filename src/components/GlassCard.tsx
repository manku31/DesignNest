import type { HTMLAttributes } from "react";

export default function GlassCard({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`glass-card bg-white/10 backdrop-blur-xl border border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
