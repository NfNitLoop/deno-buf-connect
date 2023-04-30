deno-buf-connect
================

Helpers and examples for using [Connect], by the folks at [Buf], in Deno. 🦕✨ 

Connect is a tool for quickly making type-safe gRPC servers and clients.

The author of this project is not affiliated with either the company or project.
(I just wanted to use Connect in Deno and hit a few hurdles I want to smooth out.)

[Connect]: https://connect.build/
[Buf]: https://buf.build/

API Docs: <https://deno.land/x/buf_connect?doc>


Oak Middleware
--------------

The main feature of this repository is the oak middleware provided at 
[./middleware/oak/mod.ts]. With that, you can easily create a Connect server
in Oak, running in Deno.

See the example server and client implementations in:
[./examples/oak-server-and-client/]

[./middleware/oak/mod.ts]: https://github.com/NfNitLoop/deno-buf-connect/blob/main/middleware/oak/mod.ts
[./examples/oak-server-and-client/]: https://github.com/NfNitLoop/deno-buf-connect/tree/main/examples/oak-server-and-client#readme

Bufbuild Re-exports
-------------------

Some handy re-exports of the `bufbuild` npm libraries, via <https://esm.sh>.

My hope is that these will: 

1. Get API docs available in deno.land.  
2. Be an easy way to import these via the module autocompletion in VSCode's
   Deno auto-completion.

If you notice the versions of the reexports are too out of date please make
a PR. 🙂


Examples
--------

In addition to the previously-mentioned example *code* ([./examples/oak-server-and-client/]),
I also found getting the buf configuration right for Deno a bit finicky, so see
[buf.gen.yaml] for an example you mind find useful to follow.

[buf.gen.yaml]: https://github.com/NfNitLoop/deno-buf-connect/blob/main/examples/oak-server-and-client/buf.gen.yaml