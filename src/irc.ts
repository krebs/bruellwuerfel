import { Client } from "irc";
import { env } from "process";

const channel = "#flix";
const server = env.IRC_SERVER || "irc.r";
export const nick = "bruellwuerfel";

const ircClient = new Client(server, nick, {
  channels: [channel]
});

export const send = (message: string) => ircClient.say(channel, message);

export const onMessage = (callback: (sender: string, text: string) => void) =>
  ircClient.addListener(`message${channel}`, callback);
