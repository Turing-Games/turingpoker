import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono'

// This ensures c.env.DB is correctly typed
export type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>()

// Webhooks (clerk)
app.post("/webhooks/clerk/user", async (c) => {
  const uuid = crypto.randomUUID()
  const clerkUser = await c.req.json()
  try {
    let { results } = await c.env.DB.prepare(
      'INSERT into users (id, clerk_id) VALUES (?, ?)'
    )
      .bind(`${uuid}`, clerkUser.data.id)
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ err: e }, 500);
  }
});

// api routes
app.get("/api/v1/users", async (c) => {
  let usrStmt = await c.env.DB.prepare('SELECT * from users')
  try {
    const { results } = await usrStmt.all()
    return c.json(results);
  } catch (e) {
    return c.json({ err: JSON.stringify(e) }, 500);
  }
});

// handles assets, serving client
app.get("*", (c) => {
  const assetsFolder = c?.env?.HONO_ENV === "production" ? "/assets" : "/static";
  return c.html(
    `
    <html>
      <head>
        <meta name="viewport" content="width=device-width">
        <link rel="manifest" href="${assetsFolder}/manifest.json" />

        ${c?.env?.HONO_ENV === "production"
        ? `<script type="module" src="/assets/client.js"></script>
            <link href="/assets/client.css" rel="stylesheet" />
            <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
            <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
            <link rel="manifest" href="/assets/site.webmanifest">
            <link rel="mask-icon" href="/assets/safari-pinned-tab.svg" color="#5bbad5">
            <meta name="msapplication-TileColor" content="#da532c">
            <meta name="theme-color" content="#ffffff">
            `
        : `<script type="module" src="/src/client.tsx"></script>
            <link href="/static/styles/styles.css" rel="stylesheet" />
            <link rel="apple-touch-icon" sizes="180x180" href="/static/favico/apple-touch-icon.png">
            <link rel="icon" type="image/png" sizes="32x32" href="/static/favico/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/static/favico/favicon-16x16.png">
            <link rel="manifest" href="/static/favico/site.webmanifest">
            <link rel="mask-icon" href="/static/favico/safari-pinned-tab.svg" color="#5bbad5">
            <meta name="msapplication-TileColor" content="#da532c">
            <meta name="theme-color" content="#ffffff">
            `
      }
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>`.replace(/\n|\s{2,}/g, "")
  );
});

export default app