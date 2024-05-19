import { Hono } from 'hono'

const app = new Hono()

app.get("*", (c) => {
  return c.html(`
    <html>
      <head>
        ${c?.env?.HONO_ENV === 'production' ? (
      `<script type="module" src="/assets/client.js"></script>
            <link href="/assets/client.css" rel="stylesheet" />`
    ) : (
      `<script type="module" src="/src/client.tsx"></script>
            <link href="/static/styles/styles.css" rel="stylesheet" />`
    )}
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>`.replace(/\n|\s{2,}/g, "")
  );
});

export default app