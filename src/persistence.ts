import { Message } from "./types.ts";

const persistenceFile = Deno.env.get("IRC_HISTORY_FILE") || "history.json";

export const save = (chat: Message[]): void =>
  Deno.writeTextFileSync(persistenceFile, JSON.stringify(chat));

export const load = (): Message[] =>
  JSON.parse(Deno.readTextFileSync(persistenceFile));
