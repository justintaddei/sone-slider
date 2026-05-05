// Runs in the MAIN world — can patch native browser APIs.
// Communicates with the isolated world (isolated.ts) via postMessage.

import { toActual, toSlider } from "@/helpers";

let enabled = true;

const desc = Object.getOwnPropertyDescriptor(
  HTMLMediaElement.prototype,
  "volume",
);
if (desc?.set) {
  const nativeSet = desc.set;
  const nativeGet = desc.get!;

  Object.defineProperty(HTMLMediaElement.prototype, "volume", {
    configurable: true,
    enumerable: desc.enumerable,

    set(this: HTMLMediaElement, value: number) {
      const n = +value;
      const s = Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

      nativeSet.call(this, enabled ? toActual(s) : s);

      // Report current slider value back to the popup via the isolated bridge
      window.postMessage(
        { __sone: true, type: "volume_changed", value: this.muted ? 0 : s },
        "*",
      );
    },

    get(this: HTMLMediaElement): number {
      const actual = nativeGet.call(this);
      return enabled ? toSlider(actual) : actual;
    },
  });
}

function reportVolume() {
  const video = document.querySelector<HTMLVideoElement>("video");

  if (video) {
    window.postMessage(
      {
        __sone: true,
        type: "volume_changed",
        value: video.muted ? 0 : video.volume,
      },
      "*",
    );
  }
}

// Receive messages from the isolated bridge
window.addEventListener("message", (e: MessageEvent) => {
  if (e.source !== window) return;
  const data = e.data;
  if (data?.__sone !== true) return;

  if (data.type === "get_volume") {
    reportVolume();
    return;
  }

  if (data.type !== "set_enabled") return;

  const volumes: number[] = [];
  document
    .querySelectorAll<HTMLVideoElement>("video")
    .forEach((video) => volumes.push(video.volume));

  enabled = !!data.enabled;

  // Re-apply volume to all videos so the curve takes effect immediately
  document
    .querySelectorAll<HTMLVideoElement>("video")
    .forEach((video, i) => (video.volume = volumes[i]));

  let styleEl = document.getElementById(
    "__sone-thumb-style",
  ) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "__sone-thumb-style";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = enabled
    ? `
    .ytp-volume-slider-handle,
    .ytp-volume-slider-handle::before {
      background: #f03 !important;
    }
    .ytp-volume-slider-handle::after {
      background: color-mix(in srgb, transparent 80%, #f03) !important;
    }
    `
    : "";
});
