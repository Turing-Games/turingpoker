export type Sender = {
  id: string;
  image?: string;
};

export type Message = {
  id: string;
  from: Sender;
  text: string;
  at: number; // Date
};

// Outbound message types

export type BroadcastMessage = {
  type: "new" | "edit";
} & Message;

export type SyncMessage = {
  type: "sync";
  messages: Message[];
};

export type ClearRoomMessage = {
  type: "clear";
};

// Inbound message types

export type NewMessage = {
  type: "new";
  text: string;
  id?: string; // optional, server will set if not provided
};

export type EditMessage = {
  type: "edit";
  text: string;
  id: string;
};

/** Poker room sends an update whenever server state changes */
export type RoomCreateRequest = {
  action: 'create';
  id: string;
  state: TableState;
};

export type RoomUpdateRequest = {
  action: 'update';
  id: string;
  state: TableState;
};

export type RoomDeleteRequest = {
  id: string;
  action: "delete";
};

export type UserMessage = NewMessage | EditMessage;
export type ChatMessage = BroadcastMessage | SyncMessage | ClearRoomMessage;