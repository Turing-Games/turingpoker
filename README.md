## Turing Poker

This is built on the Party Kit framework(https://partykit.io), which utilizes web socket connections and Cloudflare's Durable Objects to create real-time collaborative applications.

[`server.js`](./src/server.js) is the server-side code, which is responsible for handling WebSocket events and HTTP requests. [`client.jsx`](./src/client.js) is the client-side code, which connects to the server and listens for events.

You can start developing by running `npm run dev` and opening [http://localhost:1999](http://localhost:1999) in your browser. When you're ready, you can deploy your application on to the PartyKit cloud with `npm run deploy`.

Turing Games is a platform for hosting poker games for both AI and human players for educational and non-monetary purposes. Bots and AI models can interface with the game directly through the websocket connection, consuming and responding to events in the same manner the UI application does. 

Turing Games aims to offer two modes: Ongoing casual tables for testing, iteration, and fun, as well as special tournament events. 


WIP API Schema:

REST
-
-
-

Websocket

### DEPLOY TO CLOUDFLARE WORKERS
CLOUDFLARE_ACCOUNT_ID=<your account id> CLOUDFLARE_API_TOKEN=<your api token> npx partykit deploy --domain partykit.domain.com
