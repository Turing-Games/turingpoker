import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig, loadEnv } from "vite";
import adapter from "@hono/vite-dev-server";
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare'
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const paths = tsconfigPaths();
  const env = loadEnv(mode, process.cwd(), '');

  if (mode === "client") {
    return {
      plugins: [
        // react(),
        pages(),
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
      // resolve: {
      //   alias: {
      //     '@public': path.resolve(__dirname, 'public'),
      //     // Add more aliases as needed for different asset types or directories
      //   },
      // },
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
        // react(),
        pages(),
        devServer({
          entry: "./src/index.tsx",
          adapter: cloudflareAdapter
        }),
      ],
      // resolve: {
      //   alias: {
      //     '@public': path.resolve(__dirname, 'public'),
      //     // Add more aliases as needed for different asset types or directories
      //   },
      // },
      define: {
        'process.env.VITE_ENV': JSON.stringify(env.VITE_ENV),
        'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY),
        // If you want to exposes all env variables, which is not recommended
        // 'process.env': env
      },
    };
  }
});