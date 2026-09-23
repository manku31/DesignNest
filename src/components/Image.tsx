import { useState, type ImgHTMLAttributes } from "react";

export default function Image({
  className = "",
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span
      role="img"
      aria-label={alt}
      className={`photo image-fallback ${className}`}
    />
  ) : (
    <img
      loading="lazy"
      decoding="async"
      alt={alt}
      {...props}
      className={`photo ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
