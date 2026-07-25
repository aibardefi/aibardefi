/**
 * sb-logo.webp is a 1536x1024 canvas whose "$SB" mark occupies only the centre
 * ~35% x ~27%. Rendering it whole makes the logo tiny and mis-anchored, so this
 * crops to the mark: an overflow-hidden box sized to the content aspect, with an
 * oversized image positioned so the mark fills it. All values derive from the
 * measured content box (l 0.315, t 0.322, w 0.35, h 0.27) and are unit-free, so
 * it stays crisp at any width.
 */
export function SbLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: "1.944 / 1" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/sb-logo.webp"
        alt="$SB"
        className="absolute max-w-none select-none"
        style={{ width: "285.7%", left: "-90%", top: "-119.2%" }}
      />
    </span>
  );
}
