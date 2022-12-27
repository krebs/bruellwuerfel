import { Client } from "https://deno.land/x/irc/mod.ts";

const channel = Deno.env.get("IRC_CHANNEL") || "#flix";
const server = Deno.env.get("IRC_SERVER") || "irc.r";
export const nick = Deno.env.get("IRC_NICK") || "bruellwuerfel";

const rawPort = parseInt(Deno.env.get("IRC_PORT") || "");
const port = isNaN(rawPort) ? 6667 : rawPort;

const ircClient = new Client({
  channels: [channel],
  userName: "bruellwuerfel",
  nick: nick,
  realName: "bruellwuerfel shoutbox gateway",
});

await ircClient.connect(server, port);

export const send = (userName: string, text: string) =>
  ircClient.privmsg(channel, `<${userName}> ${text}`);

export const onMessage = (callback: (sender: string, text: string) => void) =>
  ircClient.on("privmsg:channel", ({ source, params }) => {
    return callback(source.name, params.text);
  });
