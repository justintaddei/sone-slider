// Runs in the ISOLATED world — has access to chrome.* APIs.
// Bridges chrome.storage (popup) <-> postMessage (MAIN world).

import { ENABLED_KEY, VOLUME_KEY } from "@/helpers";

// Send the saved enabled state to the MAIN world on load
chrome.storage.local.get(ENABLED_KEY, (result) => {
  window.postMessage(
    { __sone: true, type: "set_enabled", enabled: result[ENABLED_KEY] ?? true },
    "*",
  );
});

// Forward storage changes from the popup to the MAIN world
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes[ENABLED_KEY]) return;
  window.postMessage(
    {
      __sone: true,
      type: "set_enabled",
      enabled: changes[ENABLED_KEY].newValue,
    },
    "*",
  );
});

// When the popup requests the current volume, relay to the MAIN world.
// Track the request so only this tab writes the result back to storage.
let pendingVolumeReport = false;

chrome.runtime.onMessage.addListener((message) => {
  if (message?.__sone === true && message.type === "get_volume") {
    pendingVolumeReport = true;
    window.postMessage({ __sone: true, type: "get_volume" }, "*");
  }
});

// Forward volume reports from the MAIN world back to storage (popup reads this).
// Only write when the popup explicitly asked — prevents other tabs from
// overwriting the value when a toggle causes all tabs to re-report.
window.addEventListener("message", (e: MessageEvent) => {
  if (e.source !== window) return;
  const data = e.data;
  if (data?.__sone !== true || data.type !== "volume_changed") return;

  if (!pendingVolumeReport) return;
  pendingVolumeReport = false;
  chrome.storage.local.set({ [VOLUME_KEY]: data.value as number });
});
