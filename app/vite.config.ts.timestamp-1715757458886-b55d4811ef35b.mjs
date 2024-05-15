// vite.config.ts
import pages from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-cloudflare-pages/dist/index.js";
import devServer from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-dev-server/dist/index.js";
import { defineConfig } from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/vite/dist/node/index.js";
import adapter from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/@hono/vite-dev-server/dist/adapter/cloudflare.js";
import tsconfigPaths from "file:///Users/jarrodluca/src/turingpoker/app/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
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
          }
        }
      }
    };
  } else {
    return {
      plugins: [
        paths,
        pages(),
        devServer({
          entry: "./src/index.tsx",
          adapter
        })
      ]
    };
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFycm9kbHVjYS9zcmMvdHVyaW5ncG9rZXIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvamFycm9kbHVjYS9zcmMvdHVyaW5ncG9rZXIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qYXJyb2RsdWNhL3NyYy90dXJpbmdwb2tlci9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGFnZXMgZnJvbSBcIkBob25vL3ZpdGUtY2xvdWRmbGFyZS1wYWdlc1wiO1xuaW1wb3J0IGRldlNlcnZlciBmcm9tIFwiQGhvbm8vdml0ZS1kZXYtc2VydmVyXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGFkYXB0ZXIgZnJvbSBcIkBob25vL3ZpdGUtZGV2LXNlcnZlci9jbG91ZGZsYXJlXCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBwYXRocyA9IHRzY29uZmlnUGF0aHMoKTtcbiAgaWYgKG1vZGUgPT09IFwiY2xpZW50XCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGx1Z2luczogW3BhdGhzXSxcbiAgICAgIGJ1aWxkOiB7XG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICBpbnB1dDogXCIuL3NyYy9jbGllbnQudHN4XCIsXG4gICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJhc3NldHMvY2xpZW50LmpzXCIsXG4gICAgICAgICAgICBjaHVua0ZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uanNgLFxuICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLltleHRdYFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcGF0aHMsXG4gICAgICAgIHBhZ2VzKCksXG4gICAgICAgIGRldlNlcnZlcih7XG4gICAgICAgICAgZW50cnk6IFwiLi9zcmMvaW5kZXgudHN4XCIsXG4gICAgICAgICAgYWRhcHRlclxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgfTtcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLE9BQU8sV0FBVztBQUNuVCxPQUFPLGVBQWU7QUFDdEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sbUJBQW1CO0FBQzFCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sUUFBUSxjQUFjO0FBQzVCLE1BQUksU0FBUyxVQUFVO0FBQ3JCLFdBQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxLQUFLO0FBQUEsTUFDZixPQUFPO0FBQUEsUUFDTCxlQUFlO0FBQUEsVUFDYixPQUFPO0FBQUEsVUFDUCxRQUFRO0FBQUEsWUFDTixnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxZQUNoQixnQkFBZ0I7QUFBQSxVQUNsQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsT0FBTztBQUNMLFdBQU87QUFBQSxNQUNMLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQSxNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsVUFDUixPQUFPO0FBQUEsVUFDUDtBQUFBLFFBQ0YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
