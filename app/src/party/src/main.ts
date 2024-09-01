import type * as Party from "partykit/server";

export default class MainPartyServer implements Party.Server {

  constructor(public party: Party.Party) { }

  static async onBeforeRequest(request: Party.Request) {
    // console.log('onbeforerequest')
    // try {
    //   const res = await authBotConnection(request);
    //   console.log({ res })
    //   return request;
    // } catch (e) {
    //   console.log('unauthorized')
    //   // authentication failed!
    //   // short-circuit the request before it's forwarded to the party
    //   return new Response("Unauthorized", { status: 401 });
    // }
    return request
  }
}