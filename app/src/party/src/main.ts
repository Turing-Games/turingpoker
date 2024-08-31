import type * as Party from "partykit/server";
import authBotConnection from "../../utils/auth";
import { IPlayer } from "./shared";

export default class MainPartyServer implements Party.Server {

  public inGamePlayers: IPlayer[] = [];
  public spectatorPlayers: IPlayer[] = [];
  public queuedPlayers: IPlayer[] = [];
  public eliminatedPlayers: IPlayer[] = [];
  public gamePhase = "pending"
  public lastActed: Record<string, number> = {};
  public winner: IPlayer = { playerId: '', isBot: false }

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