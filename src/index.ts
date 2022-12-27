import { createHash } from "https://deno.land/std@0.110.0/hash/mod.ts";
import { signal } from "https://deno.land/std@0.170.0/signal/mod.ts";
import * as dejs from "https://deno.land/x/dejs@0.10.3/mod.ts";
import { Application, Router, helpers } from "https://deno.land/x/oak/mod.ts";
import ON_DEATH from "npm:death@1.1.0";

import htmlTemplate from "./templates/html.ts";
import javascriptTemplate from "./templates/javascript.ts";
import * as persistence from "./persistence.ts";
import * as irc from "./irc.ts";
import { Message } from "./types.ts";

function generateUsername(headers: IncomingHttpHeaders): string {
  const hash = createHash("md5");
  hash.update(headers["user-agent"] || "");
  hash.update(headers["accept-language"] || "");
  hash.update((headers["accept-encoding"] || []).toString());

  return hash.toString("base64").slice(0, 3);
}

let messages: Array<Message> = [];
try {
  messages = persistence.load();
} catch (error) {}

const router = new Router();

router
  .get("/messages", (context) => {
    const { limit } = helpers.getQuery(context, { mergeParams: true });
    context.response.body = limit
      ? messages.slice(messages.length - limit)
      : messages;
  })
  .post("/messages", async (context) => {
    const requestBody = await context.request.body("json").value;
    const { message } = requestBody;

    const userName = generateUsername(context.request.headers);
    messages.push({ sender: userName, text: message });
    irc.send(userName, message);
    context.response.body = "";
  })
  .get("/index.html", (context) => {
    context.response.body = htmlTemplate;
  })
  .get("/index.js", (context) => {
    context.response.body = javascriptTemplate;
  });

ON_DEATH(() => {
  persistence.save(messages);
  Deno.exit(0);
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const rawPort = parseInt(Deno.env.get("REST_PORT") || "");
const port = isNaN(rawPort) ? 3000 : rawPort;

irc.onMessage((sender, text) => messages.push({ sender, text }));
console.log(`REST listening on ${port}`);
await app.listen({ port });
