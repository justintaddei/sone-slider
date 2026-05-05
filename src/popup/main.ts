import { ENABLED_KEY, VOLUME_KEY } from "@/helpers";
import "./style.css";
import { initChart } from "./chart";

document.querySelector("#app")!.innerHTML = `
  <header>
    <h1>Sone Slider</h1>
    <p>Perceptually linear volume for YouTube</p>
  </header>
  <label>
    Enable extension
    <input type="checkbox" id="enabled" hidden />
    <div class="switch"></div>
  </label>
  <div class="chart">
    <h2>amplitude / slider position</h2>
    <canvas></canvas>
  </div>
`;

const checkbox = document.querySelector<HTMLInputElement>("#enabled")!;
const drawChart = initChart();

let lastVolume: number | null = null;

// Load saved enabled state and draw initial chart
chrome.storage.local.get([ENABLED_KEY, VOLUME_KEY], (result) => {
  checkbox.checked = (result[ENABLED_KEY] as boolean) ?? true;
  lastVolume = result[VOLUME_KEY] as number | null;
  drawChart(checkbox.checked, lastVolume);
});

// Request the current volume from the content script
function queryCurrentVolume() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const isYouTube = tab?.url?.includes("youtube.com") ?? false;

    if (!isYouTube) {
      document.querySelector("#app")!.classList.add("inactive");
      return;
    }

    if (tab?.id != null) {
      chrome.tabs.sendMessage(tab.id, { __sone: true, type: "get_volume" });
    }
  });
}

// Write toggle to storage and redraw immediately
checkbox.addEventListener("change", () => {
  if (document.querySelector("#app")!.classList.contains("inactive")) return;

  chrome.storage.local.set({ [ENABLED_KEY]: checkbox.checked });
  drawChart(checkbox.checked, lastVolume);
  queryCurrentVolume();
});

// Receive volume reports from the content script
chrome.storage.onChanged.addListener((changes) => {
  if (!changes[VOLUME_KEY]) return;
  lastVolume = changes[VOLUME_KEY].newValue as number;
  drawChart(checkbox.checked, lastVolume);
});

queryCurrentVolume();
