import type * as Party from "partykit/server";
import authBotConnection from "./utils/auth";

export default class MainPartyServer implements Party.Server {
  constructor(public party: Party.Party) { }

  static async onBeforeRequest(request: Party.Request) {
    console.log('onbeforerequest')
    try {
      // get authentication server url from environment variables (optional)
      // const issuer = lobby.env.CLERK_ENDPOINT || DEFAULT_CLERK_ENDPOINT;
      // get token from request headers
      const test = await authBotConnection(request);
      console.log({ test })

      // forward the request onwards on onRequest
      return request;
      // return new Response("Authorized", { status: 'token' });
    } catch (e) {
      // authentication failed!
      // short-circuit the request before it's forwarded to the party
      // return new Response("Unauthorized", { status: 401 });
    }
    return request
  }
}