import { asset } from "@/lib/asset";

/**
 * The $SB logo is a tightly-cropped mark on a transparent square, so it renders
 * as-is at a fixed height. Size it via the `className` height (width auto).
 */
export function SbLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/assets/sb-logo.webp")}
        alt="$SB"
        className="h-full w-auto select-none"
      />
    </span>
  );
}
