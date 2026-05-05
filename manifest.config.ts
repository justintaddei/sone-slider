import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Sone Slider",
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["*://*.youtube.com/*"],
      run_at: "document_start",
      world: "MAIN",
    },
    {
      js: ["src/content/isolated.ts"],
      matches: ["*://*.youtube.com/*"],
      run_at: "document_start",
    },
  ],
  permissions: ["storage", "activeTab"],
});
