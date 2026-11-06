
import { useEffect, useRef, useState } from "react";

import {
  Viewer,
  EquirectangularAdapter,
} from "@photo-sphere-viewer/core";

import "@photo-sphere-viewer/core/index.css";

function TourViewer({ panorama, title, onClose }) {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !panorama) return;

    let viewer;
    let cancelled = false;

    setLoading(true);
    setError("");

    try {
      console.log("Starting 360 viewer...");
      console.log("Panorama:", panorama);
      console.log("Container size:", container.clientWidth, container.clientHeight);

      // Initialize viewer without panorama first
      viewer = new Viewer({
        container,
        adapter: EquirectangularAdapter,
        navbar: ["zoom", "move", "fullscreen"],
        loadingTxt: "Loading 360° experience...",
      });

      viewer.addEventListener("panorama-load", () => {
        console.log("Panorama loading started");
      });

      viewer.addEventListener("panorama-loaded", () => {
        console.log("Panorama loaded successfully");
      });

      viewer.addEventListener("ready", () => {
        console.log("360 viewer ready");
      });

      viewer.addEventListener("panorama-error", (event) => {
        console.error("Panorama error:", event);
      });

      // Explicitly load panorama and check its Promise
      viewer
        .setPanorama(panorama)
        .then((success) => {
          console.log("setPanorama result:", success);

          if (!cancelled && success) {
            setLoading(false);
            setError("");
          }
        })
        .catch((err) => {
          console.error("Panorama loading failed:", err);

          if (!cancelled) {
            setLoading(false);
            setError(err.message || "Unable to load panorama.");
          }
        });

    } catch (err) {
      console.error("Viewer initialization error:", err);

      setLoading(false);
      setError(err.message || "Unable to initialize viewer.");
    }

    return () => {
      cancelled = true;

      if (viewer) {
        viewer.destroy();
      }
    };
  }, [panorama]);

  return (
    <div
      className="tour-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="tour-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="tour-modal-header">
          <h3>{title || "360° Virtual Experience"}</h3>

          <button type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading && !error && (
          <p className="tour-loading">
            Loading 360° experience...
          </p>
        )}

        {error && (
          <p className="tour-error">{error}</p>
        )}

        <div
          ref={containerRef}
          className="tour-viewer"
          style={{
            width: "100%",
            height: "500px",
          }}
        />

        <p className="tour-hint">
          Drag to look around. Use the controls to zoom.
        </p>
      </div>
    </div>
  );
}

export default TourViewer;
