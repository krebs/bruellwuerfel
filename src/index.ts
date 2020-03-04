import { Request, Response, default as express } from "express";
import bodyParser from "body-parser";
import onDeath from "death";
import morgan from "morgan";

import * as persistence from "./persistence";
import * as irc from "./irc";
import { Message } from "./types";

const app = express();
const port = 3000;

let messages: Array<Message> = [];
try {
  messages = persistence.load();
} catch (error) {}

app.use(bodyParser.json(), morgan("tiny"), (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit);
  res.json(limit ? messages.slice(messages.length - limit) : messages);
});

app.post("/", (req: Request, res: Response) => {
  console.log(req.body);

  const message: string = req.body.message;
  messages.push({ sender: irc.nick, text: message });
  irc.send(message);
  res.send();
});

onDeath(() => {
  persistence.save(messages);
  process.exit();
});

app.listen(port, () => {
  irc.onMessage((sender, text) => messages.push({ sender, text }));
  console.log(`REST listening on port ${port}.`);
});
