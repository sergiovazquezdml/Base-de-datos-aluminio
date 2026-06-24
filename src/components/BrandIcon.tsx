/**
 * BrandIcon — uses Interlub's custom industrial icon set.
 *
 * The source PNGs have a white background and dark-grey strokes.
 * We invert them (white → black) so they work on dark backgrounds,
 * then apply a hue-rotate + sepia mix to tint them to any color.
 *
 * Usage:
 *   <BrandIcon name="extrusion" size={24} tint="red" />
 *   <BrandIcon name="bearings"  size={20} tint="white" opacity={0.7} />
 */

import React from "react";
import Image from "next/image";

// ── Icon catalogue ────────────────────────────────────────────────────────────
export type BrandIconName =
  | "extrusion"        // icon-extrusion.png  — die cross-section (prensa)
  | "extrusion-line"   // icon-extrusion-line.png — same die, line variant
  | "bearings"         // icon-bearings.png   — ball bearing ring
  | "chemical"         // icon-chemical.png   — test tube (lubricant)
  | "contaminated"     // icon-contaminated.png — particle contamination
  | "eco"              // icon-eco.png        — leaf (eco lubricant)
  | "longperiods"      // icon-longperiods.png — oil drop + clock
  | "logo"             // RGB_simbolo_interlub.png
  | "logo-full"        // RGB_interlub+descriptivo.png
  | "logo-white"       // RGB_interlub+descriptivo_mono_blanco.png
  | "logo-mark-white"  // RGB_logo_interlub_mono_blanco.png
  | "logo-mark-red"    // RGB_logo_interlub_negativo.png
  | "interforge"       // Interforge-KI-C.png
  ;

const FILE_MAP: Record<BrandIconName, string> = {
  "extrusion":        "/assets/icon-extrusion.png",
  "extrusion-line":   "/assets/icon-extrusion-line.png",
  "bearings":         "/assets/icon-bearings.png",
  "chemical":         "/assets/icon-chemical.png",
  "contaminated":     "/assets/icon-contaminated.png",
  "eco":              "/assets/icon-eco.png",
  "longperiods":      "/assets/icon-longperiods.png",
  "logo":             "/assets/RGB_simbolo_interlub.png",
  "logo-full":        "/assets/RGB_interlub+descriptivo.png",
  "logo-white":       "/assets/RGB_interlub+descriptivo_mono_blanco.png",
  "logo-mark-white":  "/assets/RGB_logo_interlub_mono_blanco.png",
  "logo-mark-red":    "/assets/RGB_logo_interlub_negativo.png",
  "interforge":       "/assets/Interforge-KI-C.png",
};

// ── Tint presets → CSS filter chains ─────────────────────────────────────────
// Base: invert(1) makes dark strokes white on transparent.
// Then we tint via sepia + hue-rotate + saturate.
const TINT_FILTERS: Record<string, string> = {
  white:  "invert(1)",
  red:    "invert(1) sepia(1) saturate(6) hue-rotate(320deg) brightness(0.9)",
  green:  "invert(1) sepia(1) saturate(5) hue-rotate(100deg) brightness(0.85)",
  amber:  "invert(1) sepia(1) saturate(5) hue-rotate(20deg) brightness(0.95)",
  blue:   "invert(1) sepia(1) saturate(5) hue-rotate(190deg) brightness(0.9)",
  purple: "invert(1) sepia(1) saturate(5) hue-rotate(250deg) brightness(0.85)",
  muted:  "invert(1) brightness(0.55)",
  none:   "none",  // use for logo assets that already have correct colours
};

// ── Component ─────────────────────────────────────────────────────────────────
interface BrandIconProps {
  name: BrandIconName;
  size?: number;
  /** Preset colour name or a raw CSS filter string */
  tint?: keyof typeof TINT_FILTERS | string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

export default function BrandIcon({
  name,
  size = 20,
  tint = "white",
  opacity = 1,
  className,
  style,
  alt,
}: BrandIconProps) {
  const src = FILE_MAP[name];
  const filter = TINT_FILTERS[tint] ?? tint;
  const isLogo = name.startsWith("logo") || name === "interforge";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? name}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "inline-block",
        flexShrink: 0,
        // For logo assets that already look correct, skip inversion.
        filter: isLogo ? "none" : filter,
        opacity,
        ...style,
      }}
    />
  );
}

// ── Convenience wrappers ──────────────────────────────────────────────────────
export function InterlubLogo({
  variant = "white",
  height = 28,
}: {
  variant?: "full-white" | "full-color" | "mark-white" | "mark-red" | "mark-color" | "white";
  height?: number;
}) {
  const map: Record<string, BrandIconName> = {
    "full-white":  "logo-white",
    "full-color":  "logo-full",
    "mark-white":  "logo-mark-white",
    "mark-red":    "logo-mark-red",
    "mark-color":  "logo",
    "white":       "logo-mark-white",
  };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FILE_MAP[map[variant]]}
      alt="Interlub"
      style={{ height, width: "auto", objectFit: "contain", display: "block" }}
    />
  );
}
