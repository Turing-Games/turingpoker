import { Hono } from 'hono'
import { jsx } from 'hono/jsx'
import { serveStatic } from '@hono/node-server/serve-static'
import { jsxRenderer } from 'hono/jsx-renderer';

const app = new Hono()

app.get(
  "*",
  jsxRenderer(({ children, title }: any) => {
    return <body>{children}</body>;
  })
);

app.get("/", (c) => {
  return c.render(
    <html>
      <head>
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js"></script>
        ) : (
          <script type="module" src="/src/client.tsx"></script>
        )}
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  );
});


// app.get('/hello', (c) => {
//   return c.json({
//     message: `Hello!`,
//   })
// })

// app.get('/test', (c) => {
//   return c.render(
//     <html>
//       <head>
//         {process.env.NODE_ENV == 'production' ? (
//           <script type='module' src='/app/dist/client.js'></script>
//         ) : (
//           <script type='module' src='/app/client.tsx'></script>
//         )}
//       </head>
//       <body>
//         <div id="root"></div>
//         <h1>Hello</h1>
//       </body>
//     </html>
//   )
// })


export default app