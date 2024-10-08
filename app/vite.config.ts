import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig, loadEnv } from "vite";
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  const paths = tsconfigPaths();
  const env = loadEnv(mode, process.cwd(), '');

  if (mode === "client") {
    return {
      plugins: [
        // pages(),
        paths
      ],
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
      define: {
        'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV),
        'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY)
        // If you want to exposes all env variables, which is not recommended
        // 'process.env': env
      },
    };
  } else {
    return {
      plugins: [
        paths,
        pages(),
        devServer({
          entry: "./src/index.tsx",
          adapter: cloudflareAdapter
        }),
      ],
      define: {
        'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV),
        'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
        // If you want to exposes all env variables, which is not recommended
        // 'process.env': env
      },
    };
  }
});