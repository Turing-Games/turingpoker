import { Hono } from 'hono'
import { renderer } from './renderer'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.get('*', renderer)
// app.use('/static/*', serveStatic({ root: '/' }))


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