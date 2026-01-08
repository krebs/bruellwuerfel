import { Application, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import ON_DEATH from "npm:death@1.1.0";

import htmlTemplate from "./templates/html.ts";
import javascriptTemplate from "./templates/javascript.ts";
import * as persistence from "./persistence.ts";
import * as irc from "./irc.ts";
import { Message } from "./types.ts";

async function generateUsername(headers: Headers): Promise<string> {
  const data = [
    headers.get("user-agent") || "",
    headers.get("accept-language") || "",
    headers.get("accept-encoding") || "",
  ].join("");

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = new Uint8Array(hashBuffer);
  const base64 = btoa(String.fromCharCode(...hashArray));
  return base64.slice(0, 3);
}

let messages: Array<Message> = [];
try {
  messages = persistence.load();
} catch (_error) { /* ignore missing history file */ }

const router = new Router();

router
  .get("/messages", (context) => {
    const limit = context.request.url.searchParams.get("limit");
    context.response.body = limit
      ? messages.slice(messages.length - parseInt(limit))
      : messages;
  })
  .post("/messages", async (context) => {
    const requestBody = await context.request.body.json();
    const { message } = requestBody;

    const userName = await generateUsername(context.request.headers);
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
