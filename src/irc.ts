import { Client } from "irc";
import { env } from "process";

const channel = env.IRC_CHANNEL || "#flix";
const server = env.IRC_SERVER || "irc.r";
export const nick = env.IRC_NICK || "bruellwuerfel";

const rawPort = parseInt(env.IRC_PORT || "");
const port = isNaN(rawPort) ? 6667 : rawPort;

const ircClient = new Client(server, nick, {
  channels: [channel],
  port: port,
  userName: "bruellwuerfel",
  realName: "bruellwuerfel shoutbox gateway"
});
export const send = (userName: string, message: string) =>
  ircClient.say(channel, `<${userName}> ${message}`);

export const onMessage = (callback: (sender: string, text: string) => void) =>
  ircClient.addListener(`message${channel}`, callback);
