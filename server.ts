import {yellow} from "https://deno.land/std@0.123.0/fmt/colors.ts"
import { ConnectRouter, createConnectRouter } from "./_deps/bufbuild/connect.ts";

import { ExampleService } from "./gen/protos/Example_connect.ts"
import { SeqRequest, SeqResponse } from "./gen/protos/Example_pb.ts";

import * as oak from "./_deps/oak.ts"
import { middleware } from "./oak_connect.ts"
import { isAsyncIterable } from "https://deno.land/x/oak@v9.0.1/util.ts";


// Trying to follow: https://connect.build/docs/node/getting-started

async function * seq(req: SeqRequest) {
  console.log("Got request:", req)
  let response = new SeqResponse()
  let start = BigInt(req.startAt)
  let end = start + 10n
  for (let x = start; x < end; x++) {
    response.value = x
    yield response  
    console.log("yielded:", response)
  }
}
async function unary(req: SeqRequest): Promise<SeqResponse> {
  let res = new SeqResponse({
    value: BigInt(req.startAt + 42)
  })
  return res
}

function routes (router: ConnectRouter) {
  router.service(ExampleService, {seq, unary})
}

const app = new oak.Application()
app.use(async (ctx, next) => {
  await next();
  const status = ctx.response.status
  console.log(yellow(`${ctx.request.method} ${ctx.request.url} - ${status}`));
});
app.use(middleware({ routes }))


// not found / generator test
app.use((ctx) => {
  let gen = async function*() {
    yield `line one`
    yield `\n`
    yield `line two`
  }

  let otherThing = {
    async *[Symbol.asyncIterator]() {
      yield `line one`
      yield `\n`
      yield `line two`
    }
  }

  ctx.response.body = gen()
  ctx.response.type = "text"

  const isAI = isAsyncIterable(ctx.response.body)
  console.log({isAI})


  ctx.response.status = 404

  console.log("404 response:", ctx.response)
})


let port = 8088
console.log(`Listening on: http://127.0.0.1:${port}`)

await app.listen({port: 8088})


// Move this into an oak plugin:
