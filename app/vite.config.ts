import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import adapter from "@hono/vite-dev-server/cloudflare";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig(({ mode }) => {
  const paths = tsconfigPaths();
  if (mode === "client") {
    return {
      plugins: [paths],
      build: {
        rollupOptions: {
          input: "./src/client.tsx",
          output: {
            entryFileNames: "assets/client.js",
            chunkFileNames: `assets/[name].js`,
            assetFileNames: `assets/[name].[ext]`
          },
        },
      },
    };
  } else {
    return {
      plugins: [
        paths,
        pages(),
        devServer({
          entry: "./src/index.tsx",
          adapter
        }),
      ],
    };
  }
});
