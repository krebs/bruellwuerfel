import { Request, Response, default as express } from "express";
import { IncomingHttpHeaders } from "http2";
import bodyParser from "body-parser";
import onDeath from "death";
import morgan from "morgan";
import { createHash } from "crypto";
import { env } from "process";
import { render } from "ejs";

import javascriptTemplate from "./template";
import * as persistence from "./persistence";
import * as irc from "./irc";
import { Message } from "./types";

const app = express();

const rawPort = parseInt(env.REST_PORT || "");
const port = isNaN(rawPort) ? 3000 : rawPort;

let messages: Array<Message> = [];
try {
  messages = persistence.load();
} catch (error) {}

function generateUsername(headers: IncomingHttpHeaders): string {
  const hash = createHash("md5");
  hash.update(headers["user-agent"] || "");
  hash.update(headers["accept-language"] || "");
  hash.update((headers["accept-encoding"] || []).toString());

  return hash.digest("base64").slice(0, 3);
}

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

app.get("/index.js", (req: Request, res: Response) => {
  const host = req.get("host");

  const javascript = render(javascriptTemplate, { host }, {});

  res.send(javascript);
});

app.post("/", (req: Request, res: Response) => {
  console.log(req.body);

  const userName = generateUsername(req.headers);
  const message: string = req.body.message;

  messages.push({ sender: userName, text: message });
  irc.send(userName, message);
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
