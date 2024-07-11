import { D1Database } from '@cloudflare/workers-types';
import { Hono } from 'hono'
import { createHash } from 'node:crypto';

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
      .bind(`${uuid}`, clerkUser.data?.id)
      .all();
    return c.json(results);
  } catch (e) {
    return c.json({ message: 'Error signing up', error: e }, 500);
  }
});

// api routes

// USERS
app.get("/api/v1/users", async (c) => {
  let usrStmt = c.env.DB.prepare('SELECT * from users')
  try {
    const { results } = await usrStmt.all()
    return c.json(results);
  } catch (e) {
    return c.json({ message: JSON.stringify(e) }, 500);
  }
});

app.get("/api/v1/users/:id", async (c) => {
  let usrStmt = c.env.DB.prepare('SELECT * from users WHERE clerk_id = ?').bind(c.req.param('id'))
  try {
    const { results } = await usrStmt.all()
    return c.json({ data: results[0] });
  } catch (e) {
    return c.json({ message: JSON.stringify(e) }, 500);
  }
});

// API KEYS
app.get("/api/v1/users/:id/keys", async (c) => {
  const id = c.req.param('id')
  let usrStmt = c.env.DB.prepare('SELECT * from api_keys where user_id = ? ').bind(id)
  try {
    const { results } = await usrStmt.all()
    return c.json(results);
  } catch (e) {
    return c.json({ message: JSON.stringify(e) }, 500);
  }
});

app.post("/api/v1/keys", async (c) => {
  const { userId = null, botId = null, name = '' } = await c.req.json()
  try {
    // generate key
    const uuid = crypto.randomUUID()
    const key = `turing_${crypto.randomUUID()}`
    let { results } = await c.env.DB.prepare(
      'INSERT into api_keys (id, user_id, bot_id, name, key) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(uuid, userId, botId, name, key)
      .all()
    return c.json(results);
  } catch (e) {
    return c.json({ message: 'Error creating key', error: e }, 500);
  }
});

// update key hash/viewed columns
app.put("/api/v1/keys/:id", async (c) => {
  const { key, name, viewed } = await c.req.json()
  let keyToSave = key
  const id = c.req.param('id')

  if (key.startsWith('turing')) {
    const hash = createHash('sha256')
    hash.update(key)
    keyToSave = hash.digest('hex')
  }

  try {
    let { results } = await c.env.DB.prepare(
      'UPDATE api_keys SET key = ?, name = ?, viewed = ? where id = ?'
    )
      .bind(keyToSave, name, viewed, id)
      .all()
    return c.json(results);
  } catch (e) {
    console.log(e)
    return c.json({ message: 'Error updating key', error: e }, 500);
  }
})

app.delete("/api/v1/keys/:id", async (c) => {
  const id = c.req.param('id')
  let usrStmt = c.env.DB.prepare('DELETE from api_keys where id = ? ').bind(id)
  try {
    const { results } = await usrStmt.all()
    return c.json(results);
  } catch (e) {
    return c.json({ message: JSON.stringify(e) }, 500);
  }
});

const verifyApiKey = (key: string, hash: string) => {
  const hashedKey = createHash('sha256')
  hashedKey.update(key)
  return hashedKey.digest('hex') === hash
}

// user has unhashed key
// compare key to hashed key

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