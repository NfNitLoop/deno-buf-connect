/**
 * <https://connect.build/docs/web/getting-started/#generating-the-client>
 * ... but in Deno. :) 
 * 
 * @module
 */

import { createPromiseClient } from "../../bufbuild/connect.ts";
import { createConnectTransport } from "../../bufbuild/connect-web.ts";

import { ExampleService } from "./gen/protos/Example_connect.ts"

// The transport defines what type of endpoint we're hitting.
// In our example we'll be communicating with a Connect endpoint.
// If your endpoint only supports gRPC-web, make sure to use
// `createGrpcWebTransport` instead.
const transport = createConnectTransport({
  baseUrl: "http://127.0.0.1:8088",
});

// Here we make the client itself, combining the service
// definition with the transport.
const client = createPromiseClient(ExampleService, transport);

const response = await client.unary({startAt: 2})
console.log("unary:", response)

for await (const response of client.seq({})) {
  console.log("seq", response)
}
