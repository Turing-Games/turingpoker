// vite.config.js
import pages from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-cloudflare-pages/dist/index.js";
import devServer from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-dev-server/dist/index.js";
import { defineConfig, loadEnv } from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/vite/dist/node/index.js";
import adapter from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-dev-server/dist/index.js";
import cloudflareAdapter from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-dev-server/dist/adapter/cloudflare.js";
import tsconfigPaths from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  const paths = tsconfigPaths();
  const env = loadEnv(mode, process.cwd(), "");
  if (mode === "client") {
    return {
      plugins: [
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
          }
        }
      },
      // resolve: {
      //   alias: {
      //     '@public': path.resolve(__dirname, 'public'),
      //     // Add more aliases as needed for different asset types or directories
      //   },
      // },
      define: {
        "process.env.VITE_ENV": JSON.stringify(env.VITE_ENV),
        "process.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY)
        // If you want to exposes all env variables, which is not recommended
        // 'process.env': env
      }
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
        })
      ],
      // resolve: {
      //   alias: {
      //     '@public': path.resolve(__dirname, 'public'),
      //     // Add more aliases as needed for different asset types or directories
      //   },
      // },
      define: {
        "process.env.VITE_ENV": JSON.stringify(env.VITE_ENV),
        "process.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY)
        // If you want to exposes all env variables, which is not recommended
        // 'process.env': env
      }
    };
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFycm9kbHVjYS9zcmMvdHVyaW5ncG9rZXIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFycm9kbHVjYS9zcmMvdHVyaW5ncG9rZXIvYXBwL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qYXJyb2RsdWNhL3NyYy90dXJpbmdwb2tlci9hcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGFnZXMgZnJvbSBcIkBob25vL3ZpdGUtY2xvdWRmbGFyZS1wYWdlc1wiO1xuaW1wb3J0IGRldlNlcnZlciBmcm9tIFwiQGhvbm8vdml0ZS1kZXYtc2VydmVyXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGFkYXB0ZXIgZnJvbSBcIkBob25vL3ZpdGUtZGV2LXNlcnZlclwiO1xuaW1wb3J0IGNsb3VkZmxhcmVBZGFwdGVyIGZyb20gJ0Bob25vL3ZpdGUtZGV2LXNlcnZlci9jbG91ZGZsYXJlJ1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcbiAgY29uc3QgcGF0aHMgPSB0c2NvbmZpZ1BhdGhzKCk7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xuXG4gIGlmIChtb2RlID09PSBcImNsaWVudFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcGFnZXMoKSxcbiAgICAgICAgcGF0aHNcbiAgICAgIF0sXG4gICAgICBidWlsZDoge1xuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgaW5wdXQ6IFwiLi9zcmMvY2xpZW50LnRzeFwiLFxuICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgZW50cnlGaWxlTmFtZXM6IFwiYXNzZXRzL2NsaWVudC5qc1wiLFxuICAgICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLmpzYCxcbiAgICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5bZXh0XWBcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIC8vIHJlc29sdmU6IHtcbiAgICAgIC8vICAgYWxpYXM6IHtcbiAgICAgIC8vICAgICAnQHB1YmxpYyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKSxcbiAgICAgIC8vICAgICAvLyBBZGQgbW9yZSBhbGlhc2VzIGFzIG5lZWRlZCBmb3IgZGlmZmVyZW50IGFzc2V0IHR5cGVzIG9yIGRpcmVjdG9yaWVzXG4gICAgICAvLyAgIH0sXG4gICAgICAvLyB9LFxuICAgICAgZGVmaW5lOiB7XG4gICAgICAgICdwcm9jZXNzLmVudi5WSVRFX0VOVic6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0VOViksXG4gICAgICAgICdwcm9jZXNzLmVudi5WSVRFX0NMRVJLX1BVQkxJU0hBQkxFX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0NMRVJLX1BVQkxJU0hBQkxFX0tFWSlcbiAgICAgICAgLy8gSWYgeW91IHdhbnQgdG8gZXhwb3NlcyBhbGwgZW52IHZhcmlhYmxlcywgd2hpY2ggaXMgbm90IHJlY29tbWVuZGVkXG4gICAgICAgIC8vICdwcm9jZXNzLmVudic6IGVudlxuICAgICAgfSxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHBhdGhzLFxuICAgICAgICAvLyByZWFjdCgpLFxuICAgICAgICBwYWdlcygpLFxuICAgICAgICBkZXZTZXJ2ZXIoe1xuICAgICAgICAgIGVudHJ5OiBcIi4vc3JjL2luZGV4LnRzeFwiLFxuICAgICAgICAgIGFkYXB0ZXI6IGNsb3VkZmxhcmVBZGFwdGVyXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICAgIC8vIHJlc29sdmU6IHtcbiAgICAgIC8vICAgYWxpYXM6IHtcbiAgICAgIC8vICAgICAnQHB1YmxpYyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKSxcbiAgICAgIC8vICAgICAvLyBBZGQgbW9yZSBhbGlhc2VzIGFzIG5lZWRlZCBmb3IgZGlmZmVyZW50IGFzc2V0IHR5cGVzIG9yIGRpcmVjdG9yaWVzXG4gICAgICAvLyAgIH0sXG4gICAgICAvLyB9LFxuICAgICAgZGVmaW5lOiB7XG4gICAgICAgICdwcm9jZXNzLmVudi5WSVRFX0VOVic6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0VOViksXG4gICAgICAgICdwcm9jZXNzLmVudi5WSVRFX0NMRVJLX1BVQkxJU0hBQkxFX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX0NMRVJLX1BVQkxJU0hBQkxFX0tFWSksXG4gICAgICAgIC8vIElmIHlvdSB3YW50IHRvIGV4cG9zZXMgYWxsIGVudiB2YXJpYWJsZXMsIHdoaWNoIGlzIG5vdCByZWNvbW1lbmRlZFxuICAgICAgICAvLyAncHJvY2Vzcy5lbnYnOiBlbnZcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUyxPQUFPLFdBQVc7QUFDblQsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sYUFBYTtBQUNwQixPQUFPLHVCQUF1QjtBQUM5QixPQUFPLG1CQUFtQjtBQUcxQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLFNBQVMsS0FBSyxNQUFNO0FBQ2pELFFBQU0sUUFBUSxjQUFjO0FBQzVCLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxNQUFJLFNBQVMsVUFBVTtBQUNyQixXQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsUUFDUCxNQUFNO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLGVBQWU7QUFBQSxVQUNiLE9BQU87QUFBQSxVQUNQLFFBQVE7QUFBQSxZQUNOLGdCQUFnQjtBQUFBLFlBQ2hCLGdCQUFnQjtBQUFBLFlBQ2hCLGdCQUFnQjtBQUFBLFVBQ2xCO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQU9BLFFBQVE7QUFBQSxRQUNOLHdCQUF3QixLQUFLLFVBQVUsSUFBSSxRQUFRO0FBQUEsUUFDbkQsMENBQTBDLEtBQUssVUFBVSxJQUFJLDBCQUEwQjtBQUFBO0FBQUE7QUFBQSxNQUd6RjtBQUFBLElBQ0Y7QUFBQSxFQUNGLE9BQU87QUFDTCxXQUFPO0FBQUEsTUFDTCxTQUFTO0FBQUEsUUFDUDtBQUFBO0FBQUEsUUFFQSxNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsVUFDUixPQUFPO0FBQUEsVUFDUCxTQUFTO0FBQUEsUUFDWCxDQUFDO0FBQUEsTUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BT0EsUUFBUTtBQUFBLFFBQ04sd0JBQXdCLEtBQUssVUFBVSxJQUFJLFFBQVE7QUFBQSxRQUNuRCwwQ0FBMEMsS0FBSyxVQUFVLElBQUksMEJBQTBCO0FBQUE7QUFBQTtBQUFBLE1BR3pGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
