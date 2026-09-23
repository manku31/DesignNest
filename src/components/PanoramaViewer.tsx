import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { RoomPanorama } from "../data/mockData";
import "pannellum/build/pannellum.css";

export interface PanoramaView {
  yaw: number;
  pitch: number;
  hfov: number;
}

export interface PanoramaControls {
  play: (speed: number) => void;
  pause: () => void;
  zoom: (delta: number) => void;
  reset: () => void;
}

interface Props {
  panorama: RoomPanorama;
  onReady: () => void;
  onError: () => void;
  onInteraction: () => void;
  onViewChange: (view: PanoramaView) => void;
}

const PanoramaViewer = forwardRef<PanoramaControls, Props>(
  function PanoramaViewer(
    { panorama, onReady, onError, onInteraction, onViewChange },
    ref,
  ) {
    const host = useRef<HTMLDivElement>(null);
    const instance = useRef<Pannellum.Viewer | null>(null);
    const handlers = useRef({ onReady, onError, onInteraction, onViewChange });

    useEffect(() => {
      handlers.current = { onReady, onError, onInteraction, onViewChange };
    }, [onReady, onError, onInteraction, onViewChange]);

    useImperativeHandle(
      ref,
      () => ({
        play: (speed) => instance.current?.startAutoRotate(-speed, 0),
        pause: () => {
          instance.current?.stopAutoRotate();
          instance.current?.stopMovement();
        },
        zoom: (delta) => {
          const viewer = instance.current;
          if (viewer)
            viewer.setHfov(
              Math.max(40, Math.min(95, viewer.getHfov() + delta)),
              false,
            );
        },
        reset: () => {
          const viewer = instance.current;
          viewer?.stopAutoRotate();
          viewer?.stopMovement();
          viewer?.lookAt(panorama.pitch, panorama.yaw, panorama.hfov, false);
        },
      }),
      [panorama.pitch, panorama.yaw, panorama.hfov],
    );

    useEffect(() => {
      const container = host.current;
      if (!container) return;
      let disposed = false;
      let viewer: Pannellum.Viewer | null = null;
      let resizeObserver: ResizeObserver | undefined;
      let ticker: number | undefined;
      let lastView = { yaw: Infinity, pitch: Infinity, hfov: Infinity };

      async function initialize() {
        try {
          // Load WebGL code only when a tour is actually opened.
          await import("pannellum");
          if (disposed) return;
          viewer = window.pannellum.viewer(container!, {
            type: "equirectangular",
            panorama: panorama.image,
            autoLoad: true,
            showControls: false,
            showFullscreenCtrl: false,
            compass: false,
            haov: 360,
            vaov: 180,
            yaw: panorama.yaw,
            pitch: panorama.pitch,
            hfov: panorama.hfov,
            minHfov: 40,
            maxHfov: 95,
            disableKeyboardCtrl: true,
            mouseZoom: true,
            draggable: true,
            touchPanSpeedCoeffFactor: 0.8,
            backgroundColor: [0.055, 0.051, 0.047],
            escapeHTML: true,
            strings: { loadingLabel: "Stepping inside…" },
          });
          instance.current = viewer;
          viewer.on("load", () => {
            if (!disposed) handlers.current.onReady();
          });
          viewer.on("error", () => {
            if (!disposed) handlers.current.onError();
          });
          resizeObserver = new ResizeObserver(() => viewer?.resize());
          resizeObserver.observe(container!);

          // Pannellum exposes final movement events, so sample live orientation
          // for the compass during a drag or tour, without re-rendering idle views.
          ticker = window.setInterval(() => {
            if (!viewer?.isLoaded() || disposed) return;
            const next = {
              yaw: viewer.getYaw(),
              pitch: viewer.getPitch(),
              hfov: viewer.getHfov(),
            };
            if (
              Object.keys(next).some(
                (key) =>
                  Math.abs(
                    next[key as keyof PanoramaView] -
                      lastView[key as keyof PanoramaView],
                  ) > 0.1,
              )
            ) {
              lastView = next;
              handlers.current.onViewChange(next);
            }
          }, 100);
        } catch {
          if (!disposed) handlers.current.onError();
        }
      }
      void initialize();
      return () => {
        disposed = true;
        window.clearInterval(ticker);
        resizeObserver?.disconnect();
        instance.current = null;
        viewer?.destroy();
      };
    }, [panorama.image, panorama.yaw, panorama.pitch, panorama.hfov]);

    function interruptTour() {
      instance.current?.stopAutoRotate();
      handlers.current.onInteraction();
    }

    return (
      <div
        ref={host}
        className="panorama-surface"
        role="region"
        aria-label={`Interactive 360 degree ${panorama.roomType.toLowerCase()} panorama`}
        aria-describedby="panorama-instructions"
        tabIndex={0}
        onPointerDownCapture={interruptTour}
        onWheelCapture={interruptTour}
        onKeyDown={(event) => {
          const viewer = instance.current;
          if (!viewer?.isLoaded()) return;
          const keys = [
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "+",
            "=",
            "-",
            "Home",
          ];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          interruptTour();
          if (event.key === "Home")
            viewer.lookAt(panorama.pitch, panorama.yaw, panorama.hfov, false);
          else if (["+", "=", "-"].includes(event.key))
            viewer.setHfov(
              Math.max(
                40,
                Math.min(95, viewer.getHfov() + (event.key === "-" ? 5 : -5)),
              ),
              false,
            );
          else
            viewer.lookAt(
              Math.max(
                -85,
                Math.min(
                  85,
                  viewer.getPitch() +
                    (event.key === "ArrowUp"
                      ? 8
                      : event.key === "ArrowDown"
                        ? -8
                        : 0),
                ),
              ),
              viewer.getYaw() +
                (event.key === "ArrowRight"
                  ? 12
                  : event.key === "ArrowLeft"
                    ? -12
                    : 0),
              viewer.getHfov(),
              false,
            );
        }}
      />
    );
  },
);

export default PanoramaViewer;
