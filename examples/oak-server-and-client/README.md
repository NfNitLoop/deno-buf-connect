oak-server-and-client
=====================

A demo of using Buf Connect in Deno, with Oak.

 * `protos/`: the source protobuf file, which declares the gRPC service(s)
   and types.
 * `gen/` the output of code generation (with the exception of bufbuild/protobuf.ts)
 * `./server/server.ts` a sample server that implements the service.
 * `./client.ts` A client that queries the service.

You can run: 

 * `deno task generate` to regenerate the service(s).
 * `deno task server` to start up the server.
 * `deno task client` to run the client to connect to the server.