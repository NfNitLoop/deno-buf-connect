/**
 * A simple/example server implementation as in:
 * <https://connect.build/docs/node/getting-started>
 * 
 * However, this one uses middleware for serving gRPC via Oak in Deno.
 * 
 * [View Source](https://github.com/NfNitLoop/deno-buf-connect/blob/main/examples/oak-server-and-client/server/server.ts)
 * 
 * @module
 */

import {yellow} from "https://deno.land/std@0.123.0/fmt/colors.ts"
import * as oak from "../../../middleware/oak/_deps/oak.ts"

import { createConnectRouter } from "../../../bufbuild/connect.ts";
import { middleware } from "../../../middleware/oak/mod.ts"
import { routes } from "./connect.ts"


const app = new oak.Application()

// Just some simple logging to show requests coming through to the server:
app.use(async (ctx, next) => {
  await next();
  const status = ctx.response.status
  console.log(yellow(`${ctx.request.method} ${ctx.request.url} - ${status}`));
});

app.use(middleware({ routes, createConnectRouter }))

app.use((ctx) => {
  ctx.response.status = 404
  ctx.response.body = `No such path: ${ctx.request.url.pathname}`
})

let port = 8088
console.log(`Listening on: http://127.0.0.1:${port}`)

await app.listen({port: 8088})
