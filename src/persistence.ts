import * as fs from "fs";
import { env } from "process";

import { Message } from "./types";

const persistenceFile = env.IRC_HISTORY_FILE || "history.json";

export const save = (chat: Message[]): void =>
  fs.writeFileSync(persistenceFile, JSON.stringify(chat));

export const load = (): Message[] =>
  JSON.parse(fs.readFileSync(persistenceFile).toString());
