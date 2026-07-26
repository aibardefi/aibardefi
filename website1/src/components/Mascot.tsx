import Image from "next/image";

/**
 * Kapibara Blyatovich.
 *
 * One place that knows where the artwork lives and what its real aspect ratio
 * is, so no section has to hardcode either. The backdrop was cut out of the
 * upload, so this composites cleanly on any ground.
 */

export const MASCOT_SRC = "/assets/kapibara.webp";
export const MASCOT_W = 795;
export const MASCOT_H = 1008;

/**
 * His eyes, as fractions of the artwork. Measured from the file rather than
 * eyeballed — anything drawn over them (a tracking pupil, a sleeping eyelid)
 * has to sit inside a white sliver only ~3% of the image tall, and guessing
 * puts it outside the eye.
 */
export const EYES = {
  left: { cx: 0.3157, cy: 0.4812 },
  right: { cx: 0.6701, cy: 0.4811 },
  halfWidth: 0.0679,
  halfHeight: 0.0164,
};

export function Mascot({
  className,
  priority = false,
  alt = "Kapibara Blyatovich",
  sizes = "(max-width: 640px) 60vw, 320px",
}: {
  className?: string;
  priority?: boolean;
  alt?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={MASCOT_SRC}
      alt={alt}
      width={MASCOT_W}
      height={MASCOT_H}
      priority={priority}
      sizes={sizes}
      className={className}
      draggable={false}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
