import { Hono } from 'hono'
import { jsxRenderer } from 'hono/jsx-renderer';
import React from 'react'
import Client from './client';

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
        {c?.env?.HONO_ENV === 'production' ? (
          <>
            <script src="/assets/client.js"></script>
            <link href="/assets/client.css" rel="stylesheet" />
          </>
        ) : (
          <>
            <script src="/src/client.tsx"></script>
            <link href="/static/styles/styles.css" rel="stylesheet" />
          </>
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