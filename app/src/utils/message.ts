import { BroadcastMessage, Message, SyncMessage } from "@app/types/message";
import { nanoid } from "nanoid";

export const newMessage = (msg: Omit<Message, "id" | "at">) =>
  JSON.stringify(<BroadcastMessage>{
    type: "new",
    id: nanoid(),
    at: Date.now(),
    ...msg,
  });

export const editMessage = (msg: Omit<Message, "at">) =>
  JSON.stringify(<BroadcastMessage>{
    type: "edit",
    at: Date.now(),
    ...msg,
  });

export const syncMessage = (messages: Message[]) =>
  JSON.stringify(<SyncMessage>{ type: "sync", messages });

export const systemMessage = (text: string) =>
  newMessage({ from: { id: "system" }, text });
