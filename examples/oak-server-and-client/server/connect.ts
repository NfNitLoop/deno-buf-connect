/**
 * This module contains the Connect implementation of the protobuf service.
 * @module
 */

import { delay } from "https://deno.land/std@0.185.0/async/delay.ts";
import type { ConnectRouter } from "../../../bufbuild/connect.ts";
import { ExampleService } from "../gen/protos/Example_connect.ts"
import { SeqRequest, SeqResponse } from "../gen/protos/Example_pb.ts";

// A simple request/response. May be async:
// deno-lint-ignore require-await
async function unary(req: SeqRequest): Promise<SeqResponse> {
    return new SeqResponse({
        value: BigInt(req.startAt + 40)
    })
}

//
async function * seq(req: SeqRequest) {
    console.log("seq() got request:", req)
    const response = new SeqResponse()
    const start = BigInt(req.startAt)
    const end = start + 10n
    for (let x = start; x < end; x++) {
        await delay(100)
        response.value = x
        yield response  
        console.log("yielded:", response)
    }
  }
  

  
  export function routes (router: ConnectRouter) {
    router.service(ExampleService, {seq, unary})
  }