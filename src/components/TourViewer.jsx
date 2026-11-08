
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

    if (!container || !panorama) {
      setLoading(false);
      setError("Panorama image path is missing.");
      return;
    }

    let viewer;
    let cancelled = false;

    async function initializeViewer() {
      setLoading(true);
      setError("");

      try {
        console.log("Starting Photo Sphere Viewer...");
        console.log("Image path:", panorama);

        // Initialize viewer without loading an image
        viewer = new Viewer({
          container,
          adapter: EquirectangularAdapter,
          navbar: ["zoom", "move", "fullscreen"],
          loadingTxt: "Loading 360° experience...",
          defaultZoomLvl: 50,
        });

        console.log("Viewer initialized.");

        // Load the panorama only once
        const result = await viewer.setPanorama(panorama);

        console.log("Panorama loading result:", result);

        if (cancelled) return;

        if (result === true) {
          setLoading(false);
          setError("");
          console.log("360° panorama loaded!");
        } else {
          setLoading(false);
          setError(
            "Panorama loading was cancelled. Please close and reopen the viewer."
          );
          console.warn("Panorama loading returned false.");
        }
      } catch (err) {
        console.error("360° loading error:", err);

        if (!cancelled) {
          setLoading(false);
          setError(
            err?.message || "Unable to load the panorama image."
          );
        }
      }
    }

    initializeViewer();

    return () => {
      cancelled = true;

      if (viewer) {
        viewer.destroy();
        viewer = null;
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

          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
          >
            ✕
          </button>
        </div>

        {loading && (
          <p className="tour-loading">
            Loading 360° experience...
          </p>
        )}

        {error && (
          <p className="tour-error">
            {error}
          </p>
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
