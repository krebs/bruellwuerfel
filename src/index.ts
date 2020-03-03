import { Client } from "irc";
import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import { env } from "process";
import onDeath from "death";

interface Message {
  sender: string;
  text: string;
}

const flixChannel = "#flix";
const ircServer = env.IRC_SERVER || "irc.r";
const ircNick = "bruellwuerfel";

const app = express();
const port = 3000;

let messages: Array<Message> = [];
try {
  messages = JSON.parse(fs.readFileSync("history.json").toString());
} catch (error) {}

const ircClient = new Client(ircServer, ircNick, {
  channels: [flixChannel]
});

app.use(bodyParser());

app.get("/", (req: express.Request, res: express.Response) => {
  const limit = parseInt(req.query.limit);
  const reverseMessages = [...messages].reverse();
  res.json(limit ? reverseMessages.slice(0, limit) : reverseMessages);
});

app.post("/", (req: express.Request, res: express.Response) => {
  const message: string = req.body.message;
  messages.push({ sender: ircNick, text: message });
  ircClient.say(flixChannel, message);
  res.json("ok");
});

onDeath(() => fs.writeFileSync("history.json", JSON.stringify(messages)));

app.listen(port, () => {
  ircClient.addListener(
    `message${flixChannel}`,
    (sender: string, text: string) => messages.push({ sender, text })
  );
  console.log(`REST listening on port ${port}.`);
});
