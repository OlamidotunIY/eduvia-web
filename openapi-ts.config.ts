// Run: pnpm openapi-ts
import { defineConfig } from "@hey-api/openapi-ts";
import { loadEnv } from "vite";

const { VITE_API_URL } = loadEnv("development", process.cwd(), "VITE_");

if (!VITE_API_URL) {
  throw new Error("VITE_API_URL must be set in .env");
}

export default defineConfig({
  input: new URL('/openapi.json', VITE_API_URL).toString(),
  output: {
    path: "src/shared/api/generated",
    postProcess: ['prettier'],
  },
  plugins: ["@hey-api/client-axios"]
});
