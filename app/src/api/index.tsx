import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono'
import { clerk } from './webhooks';
import { users } from './users';
import { keys } from './keys';
import { games } from './games';
import { tournaments } from './tournaments';

// This ensures c.env.DB is correctly typed
export type Bindings = {
  DB: D1Database;
  BOT_SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>()

// WEBHOOKS (clerk)
app.post("/webhooks/clerk/user", clerk.create);

// USERS
app.get("/api/v1/users/:id", users.get);
app.get("/api/v1/users/:id/keys", users.getKeys);

// GAMES
app.get("/api/v1/games", games.get)
app.post('/api/v1/games', games.create)

// KEYS
app.post("/api/v1/keys", keys.create)
app.put("/api/v1/keys/:id", keys.update)
app.delete("/api/v1/keys/:id", keys.delete);
app.get("/api/v1/keys/verify", keys.verify);

// TOURNAMENTS
app.get("/api/v1/tournaments", tournaments.get)
app.post('/api/v1/tournaments', tournaments.create)

// LOCAL DEVELOPMENT ROUTES
app.get('/api/dev/keys', async (c) => {
  if (c.env.HONO_ENV !== 'production') {
    let usrStmt = c.env.DB.prepare('SELECT * from api_keys;')
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  } else {
    return c.json({}, 401);
  }
})

app.get('/api/dev/users', async (c) => {
  if (c.env.HONO_ENV !== 'production') {
    let usrStmt = c.env.DB.prepare('SELECT * from users;')
    try {
      const { results } = await usrStmt.all()
      return c.json(results);
    } catch (e) {
      return c.json({ message: JSON.stringify(e) }, 500);
    }
  } else {
    return c.json({}, 401);
  }
})

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