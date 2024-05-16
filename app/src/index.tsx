import { Hono } from 'hono'

const app = new Hono()

app.get("/", (c) => {
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