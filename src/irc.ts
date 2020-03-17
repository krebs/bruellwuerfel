import { Client } from "irc";
import { env } from "process";

const channel = env.IRC_CHANNEL || "#flix";
const server = env.IRC_SERVER || "irc.r";
export const nick = env.IRC_NICK || "bruellwuerfel";
let port = 6667;

try {
  port = parseInt(env.IRC_PORT || "");
} catch (error) {}

const ircClient = new Client(server, nick, {
  channels: [channel],
  port: port
});

export const send = (userName: string, message: string) =>
  ircClient.say(channel, `<${userName}> ${message}`);

export const onMessage = (callback: (sender: string, text: string) => void) =>
  ircClient.addListener(`message${channel}`, callback);
