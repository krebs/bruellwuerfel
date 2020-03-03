import { Client } from "irc";
import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import { env } from "process";
import onDeath from "death";
import morgan from "morgan";

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

app.use(bodyParser.json(), morgan("tiny"), function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req: express.Request, res: express.Response) => {
  const limit = parseInt(req.query.limit);
  const limitedMessages = [...messages]
    .reverse()
    .slice(0, limit)
    .reverse();
  res.json(limit ? limitedMessages : messages);
});

app.post("/", (req: express.Request, res: express.Response) => {
  console.log(req.body);
  const message: string = req.body.message;
  messages.push({ sender: ircNick, text: message });
  ircClient.say(flixChannel, message);
  res.json("ok");
});

onDeath(() => {
  fs.writeFileSync("history.json", JSON.stringify(messages));
  process.exit();
});

app.listen(port, () => {
  ircClient.addListener(
    `message${flixChannel}`,
    (sender: string, text: string) => messages.push({ sender, text })
  );
  console.log(`REST listening on port ${port}.`);
});
