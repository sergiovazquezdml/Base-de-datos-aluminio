"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GlobePoint {
  lat: number;
  lng: number;
  pais: string;
  count: number;
  interlubCount: number;
  empresasNombres: string[];
  flag: string;
}

interface PressGlobeProps {
  points: GlobePoint[];
  onCountryClick?: (pais: string | null) => void;
  selectedCountry?: string | null;
}

// ─── Coordinate map (lat/lng) ─────────────────────────────────────────────────
export const COUNTRY_LATLONG: Record<string, { lat: number; lng: number; flag: string }> = {
  "México": { lat: 23.6345, lng: -102.5528, flag: "🇲🇽" },
  "Mexico": { lat: 23.6345, lng: -102.5528, flag: "🇲🇽" },
  "Estados Unidos": { lat: 37.0902, lng: -95.7129, flag: "🇺🇸" },
  "USA": { lat: 37.0902, lng: -95.7129, flag: "🇺🇸" },
  "Canadá": { lat: 56.1304, lng: -106.3468, flag: "🇨🇦" },
  "Canada": { lat: 56.1304, lng: -106.3468, flag: "🇨🇦" },
  "Colombia": { lat: 4.5709, lng: -74.2973, flag: "🇨🇴" },
  "Ecuador": { lat: -1.8312, lng: -78.1834, flag: "🇪🇨" },
  "Brasil": { lat: -14.2350, lng: -51.9253, flag: "🇧🇷" },
  "Brazil": { lat: -14.2350, lng: -51.9253, flag: "🇧🇷" },
  "España": { lat: 40.4637, lng: -3.7492, flag: "🇪🇸" },
  "Spain": { lat: 40.4637, lng: -3.7492, flag: "🇪🇸" },
  "Alemania": { lat: 51.1657, lng: 10.4515, flag: "🇩🇪" },
  "Germany": { lat: 51.1657, lng: 10.4515, flag: "🇩🇪" },
  "Italia": { lat: 41.8719, lng: 12.5674, flag: "🇮🇹" },
  "Italy": { lat: 41.8719, lng: 12.5674, flag: "🇮🇹" },
  "Emiratos Árabes": { lat: 23.4241, lng: 53.8478, flag: "🇦🇪" },
  "Emiratos Árabes Unidos": { lat: 23.4241, lng: 53.8478, flag: "🇦🇪" },
  "UAE": { lat: 23.4241, lng: 53.8478, flag: "🇦🇪" },
  "India": { lat: 20.5937, lng: 78.9629, flag: "🇮🇳" },
  "Australia": { lat: -25.2744, lng: 133.7751, flag: "🇦🇺" },
  "China": { lat: 35.8617, lng: 104.1954, flag: "🇨🇳" },
  "Kenia": { lat: -0.0236, lng: 37.9062, flag: "🇰🇪" },
  "Turquía": { lat: 38.9637, lng: 35.2433, flag: "🇹🇷" },
  "Turkey": { lat: 38.9637, lng: 35.2433, flag: "🇹🇷" },
  "Francia": { lat: 46.2276, lng: 2.2137, flag: "🇫🇷" },
  "France": { lat: 46.2276, lng: 2.2137, flag: "🇫🇷" },
  "Reino Unido": { lat: 55.3781, lng: -3.4360, flag: "🇬🇧" },
  "UK": { lat: 55.3781, lng: -3.4360, flag: "🇬🇧" },
  "Japón": { lat: 36.2048, lng: 138.2529, flag: "🇯🇵" },
  "Japan": { lat: 36.2048, lng: 138.2529, flag: "🇯🇵" },
  "Argentina": { lat: -38.4161, lng: -63.6167, flag: "🇦🇷" },
  "Chile": { lat: -35.6751, lng: -71.5430, flag: "🇨🇱" },
  "Perú": { lat: -9.1900, lng: -75.0152, flag: "🇵🇪" },
  "Polonia": { lat: 51.9194, lng: 19.1451, flag: "🇵🇱" },
};

// Default altitude = camera distance from surface
const DEFAULT_ALTITUDE = 2.0;

function GlobeLoader() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: "1rem", color: "var(--text-muted)"
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.08)",
        borderTopColor: "var(--interlub-red)",
        animation: "spinGlobe 0.9s linear infinite"
      }} />
      <style>{`@keyframes spinGlobe { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: "0.78rem" }}>Cargando globo 3D…</span>
    </div>
  );
}

// ─── Globe rendered component ─────────────────────────────────────────────────
function GlobeRenderer({ points, onCountryClick, selectedCountry }: PressGlobeProps) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const Globe = (require("react-globe.gl") as any).default;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ data: GlobePoint; x: number; y: number } | null>(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [countries, setCountries] = useState<any>({ features: [] });
  const [hoveredPolygon, setHoveredPolygon] = useState<unknown>(null);
  const isHoveredRef = useRef(false);
  useEffect(() => {
    fetch("https://vasturiano.github.io/react-globe.gl/example/datasets/ne_110m_admin_0_countries.geojson")
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Error loading countries GeoJSON", err));
  }, []);

  // Measure container and set dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setW(el.clientWidth);
      setH(el.clientHeight);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Setup controls after globe mounts
  useEffect(() => {
    if (!globeRef.current || w === 0) return;
    const globe = globeRef.current;
    const controls = globe.controls();

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.5;

    // Lock altitude so zoom only scales the view (not moves camera in)
    // Use minDistance/maxDistance to limit but allow small range
    controls.minDistance = 250;   // closer than this = too close
    controls.maxDistance = 600;   // farther = too far out, prevent clipping

    // No dolly (no zoom through camera), just orbit
    controls.enablePan = false;

    globe.pointOfView({ lat: 15, lng: -15, altitude: DEFAULT_ALTITUDE }, 0);
  }, [w]);

  // Focus on selected country
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !selectedCountry) return;
    const coords = COUNTRY_LATLONG[selectedCountry];
    if (!coords) return;
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.4 }, 900);

    // Zoom back out to DEFAULT_ALTITUDE and resume auto-rotate after a short delay
    const timer = setTimeout(() => {
      globe.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: DEFAULT_ALTITUDE }, 1000);
      if (!isHoveredRef.current) {
        globe.controls().autoRotate = true;
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [selectedCountry]);

  // Resume auto-rotate when country is deselected
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || selectedCountry) return;
    if (!isHoveredRef.current) {
      globe.controls().autoRotate = true;
    }
    globe.pointOfView({ lat: 15, lng: -15, altitude: DEFAULT_ALTITUDE }, 1200);
  }, [selectedCountry]);

  const handleClick = useCallback((point: object) => {
    const p = point as GlobePoint;
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }
    onCountryClick?.(p.pais);
  }, [onCountryClick]);

  const handleHover = useCallback((point: object | null, _prev: object | null, event?: MouseEvent) => {
    if (containerRef.current) {
      containerRef.current.style.cursor = point ? "pointer" : "default";
    }
    if (!point || !event || !containerRef.current) {
      setTooltip(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      data: point as GlobePoint,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (globeRef.current && !selectedCountry) {
      globeRef.current.controls().autoRotate = true;
    }
  }, [selectedCountry]);

  // Larger radius: base 0.5, max ~1.5
  const pointRadius = useCallback((point: object) => {
    const p = point as GlobePoint;
    return Math.min(1.5, 0.5 + p.count * 0.25);
  }, []);

  const pointAltitude = useCallback((point: object) => {
    const p = point as GlobePoint;
    return p.pais === selectedCountry ? 0.025 : 0.015;
  }, [selectedCountry]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      {w > 0 && h > 0 && (
        <Globe
          ref={globeRef}
          width={w}
          height={h}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="data:image/gif;base64,R0lGODlhAQABAIABABYWFiAAACH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          bumpImageUrl={undefined}
          showAtmosphere={true}
          atmosphereColor="#CC0000"
          atmosphereAltitude={0.14}
          polygonsData={countries.features}
          polygonCapColor={(d: unknown) => {
            const country = d as { properties?: { name?: string; NAME?: string; ADMIN?: string } };
            const name = country?.properties?.name || country?.properties?.NAME || country?.properties?.ADMIN || "";
            const isSelected = selectedCountry && (
              name.toLowerCase() === selectedCountry.toLowerCase() ||
              (selectedCountry.toLowerCase() === "estados unidos" && name.toLowerCase() === "united states") ||
              (selectedCountry.toLowerCase() === "méxico" && name.toLowerCase() === "mexico") ||
              (selectedCountry.toLowerCase() === "españa" && name.toLowerCase() === "spain") ||
              (selectedCountry.toLowerCase() === "alemania" && name.toLowerCase() === "germany") ||
              (selectedCountry.toLowerCase() === "italia" && name.toLowerCase() === "italy") ||
              (selectedCountry.toLowerCase() === "reino unido" && name.toLowerCase() === "united kingdom") ||
              (selectedCountry.toLowerCase() === "canadá" && name.toLowerCase() === "canada") ||
              (selectedCountry.toLowerCase() === "brasil" && name.toLowerCase() === "brazil")
            );
            return isSelected ? "rgba(204, 0, 0, 0.35)" : "#3c3c3c";
          }}
          polygonSideColor={() => "#3c3c3c"}
          polygonStrokeColor={(d: unknown) => {
            const country = d as { properties?: { name?: string; NAME?: string; ADMIN?: string } };
            const name = country?.properties?.name || country?.properties?.NAME || country?.properties?.ADMIN || "";
            const isSelected = selectedCountry && (
              name.toLowerCase() === selectedCountry.toLowerCase() ||
              (selectedCountry.toLowerCase() === "estados unidos" && name.toLowerCase() === "united states") ||
              (selectedCountry.toLowerCase() === "méxico" && name.toLowerCase() === "mexico") ||
              (selectedCountry.toLowerCase() === "españa" && name.toLowerCase() === "spain") ||
              (selectedCountry.toLowerCase() === "alemania" && name.toLowerCase() === "germany") ||
              (selectedCountry.toLowerCase() === "italia" && name.toLowerCase() === "italy") ||
              (selectedCountry.toLowerCase() === "reino unido" && name.toLowerCase() === "united kingdom") ||
              (selectedCountry.toLowerCase() === "canadá" && name.toLowerCase() === "canada") ||
              (selectedCountry.toLowerCase() === "brasil" && name.toLowerCase() === "brazil")
            );
            return (d === hoveredPolygon || isSelected) ? "rgba(204, 0, 0, 0.85)" : "rgba(0, 0, 0, 0)";
          }}
          polygonAltitude={0.005}
          polygonTransitionDuration={0}
          onPolygonHover={(polygon: unknown) => {
            setHoveredPolygon(polygon);
          }}
          onGlobeClick={() => onCountryClick?.(null)}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => "#CC0000"}
          pointRadius={pointRadius}
          pointAltitude={pointAltitude}
          pointResolution={12}
          onPointClick={handleClick}
          onPointHover={handleHover}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: Math.min(tooltip.x + 14, w - 190),
          top: Math.max(tooltip.y - 80, 8),
          background: "rgba(8,8,18,0.97)",
          border: "1px solid rgba(255,255,255,0.09)",
          backdropFilter: "blur(20px)",
          borderRadius: 12,
          padding: "0.7rem 0.95rem",
          pointerEvents: "none",
          zIndex: 30,
          boxShadow: "0 8px 32px rgba(0,0,0,0.85)",
          minWidth: 165,
        }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "0.88rem", color: "#fff" }}>
            {tooltip.data.flag} {tooltip.data.pais}
          </p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.73rem", color: "rgba(255,255,255,0.5)" }}>
            Prensas: <strong style={{ color: "#fff" }}>{tooltip.data.count}</strong>
          </p>
          <p style={{ margin: "0.1rem 0 0", fontSize: "0.73rem", color: "rgba(255,255,255,0.5)" }}>
            Interlub:{" "}
            <strong style={{ color: "#fff" }}>
              {tooltip.data.count === 0 ? "—"
                : `${Math.round((tooltip.data.interlubCount / tooltip.data.count) * 100)}%`}
            </strong>
          </p>
          {tooltip.data.empresasNombres.length > 0 && (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.67rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
              {tooltip.data.empresasNombres.slice(0, 2).join(" · ")}
              {tooltip.data.empresasNombres.length > 2 ? ` +${tooltip.data.empresasNombres.length - 2}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dynamic (no SSR) export ──────────────────────────────────────────────────
const PressGlobe = dynamic(() => Promise.resolve(GlobeRenderer), {
  ssr: false,
  loading: () => <GlobeLoader />,
});

export default PressGlobe;
