import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tempo } from "tempo-devtools/dist/vite";

// Correctly use process.env here (not import.meta.env)
const isTempo = process.env.VITE_TEMPO === "true";

export default defineConfig({
  plugins: [tempo(), react()],
  base: isTempo ? "/" : "/taskmanager-2/",
  server: {
    // @ts-ignore
    allowedHosts: isTempo ? true : undefined,
  },
});
