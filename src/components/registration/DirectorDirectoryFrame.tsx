"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import "./DirectorDirectoryFrame.css";

const LaserFlow = dynamic(() => import("./LaserFlow"), { ssr: false });

export function DirectorDirectoryFrame({
  children,
  track,
  className,
  stackIndex,
}: {
  children: ReactNode;
  track: "gimun" | "gmc";
  className?: string;
  stackIndex?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [beamColor, setBeamColor] = useState(
    track === "gimun" ? "#a31d27" : "#cca876",
  );
  const [frameWidth, setFrameWidth] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const syncTheme = () => {
      setTheme(
        document.documentElement.dataset.theme === "light" ? "light" : "dark",
      );
      const color = getComputedStyle(frame)
        .getPropertyValue("--director-beam")
        .trim();
      if (color) setBeamColor(color);
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const sizeObserver = new ResizeObserver(([entry]) => {
      setFrameWidth(entry.contentRect.width);
    });
    sizeObserver.observe(frame);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting && !motionQuery.matches);
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(frame);
    const onMotionChange = () =>
      setActive(
        !motionQuery.matches &&
          frame.getBoundingClientRect().bottom > -120 &&
          frame.getBoundingClientRect().top < window.innerHeight + 120,
      );
    motionQuery.addEventListener("change", onMotionChange);
    return () => {
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      sizeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [track]);

  // The beam travels across the open header and lands 56px inside the
  // registration table's left or right edge.
  const sideInset = frameWidth < 640 ? 18 : 42;
  const cornerBeam = (sideInset + 56) / Math.max(frameWidth, 1);

  return (
    <div
      ref={frameRef}
      className={cn("stack__card director-directory", className)}
      data-track={track}
      style={{ "--i": stackIndex ?? 0 } as CSSProperties}
    >
      {active && frameWidth > 0 && (
        <LaserFlow
          surfaceRef={surfaceRef}
          className="director-directory__laser"
          beamPosition={track === "gimun" ? cornerBeam : 1 - cornerBeam}
          color={beamColor}
          intensity={
            theme === "dark"
              ? track === "gimun"
                ? 0.72
                : 0.62
              : track === "gimun"
                ? 0.9
                : 1.12
          }
          beamWidth={1.05}
          flare={0.46}
          spread={0.68}
          spill={0.2}
          fog={0.025}
          dust={0.1}
          streaks={0.2}
          dots={0}
          pulse={0.2}
          speed={0.55}
          mouseInteraction={false}
          theme={theme}
          dpr={1}
        />
      )}
      <div className="director-directory__header">
        <span className="director-directory__caption">
          REGISTRATION DESK <span>·</span> {track.toUpperCase()}
        </span>
        <h3 className="director-directory__title">{track.toUpperCase()}</h3>
        <p className="director-directory__lead">Directors of Registrations</p>
      </div>
      <div ref={surfaceRef} className="director-directory__surface">
        {children}
      </div>
      <div className="stack__shade" aria-hidden="true" />
    </div>
  );
}
