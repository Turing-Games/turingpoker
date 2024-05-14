import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import adapter from "@hono/vite-dev-server/cloudflare";
// tsconfig-paths 
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      plugins: [tsconfigPaths()],
      build: {
        rollupOptions: {
          input: "./src/client.tsx",
          output: {
            entryFileNames: "public/static/client.js",
          },
        },
      },
    };
  } else {
    return {
      plugins: [
        tsconfigPaths(),
        pages(),
        devServer({
          entry: "./src/index.tsx",
          adapter
        }),
      ],
    };
  }
});
