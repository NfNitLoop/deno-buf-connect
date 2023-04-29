/**
 * Buf Connect middleware for Oak.
 * 
 * Following the pattern from here:
 * <https://github.com/bufbuild/connect-es/blob/main/packages/connect-express/src/express-connect-middleware.ts>
 * 
 * @module
 */

import { ConnectRouter, ConnectRouterOptions, createConnectRouter } from "./_deps/bufbuild/connect.ts";
import type { UniversalHandler, UniversalServerRequest, UniversalServerResponse } from "./_deps/bufbuild/connect/protocol.ts"
import * as oak from "./_deps/oak.ts"

export interface Options extends ConnectRouterOptions {
    /**
     * A function to register your service(s) routes.
     */
    routes: (router: ConnectRouter) => void
}

export function middleware(
    options: Options
): oak.Middleware {
    let router = createConnectRouter()
    options.routes(router)

    // Associate handlers by path:
    const handlers = new Map<string, UniversalHandler>()
    for (const handler of router.handlers) {
        handlers.set(handler.requestPath, handler)
        console.log("registered path:", handler.requestPath)
    }

    const middleware = async (ctx: oak.Context, next: () => Promise<unknown>) => {
        const req = ctx.request
        const path = req.url.pathname
        console.log("Got request on path:", path)
        const handler = handlers.get(path)
        if (!handler) {
            return next()
        }
        console.log("Got handler")

        try {
            const response = await handler(universalRequest(ctx))
            setResponse(ctx, response)
            console.log("set response", ctx.response)
        } catch (cause) {
            console.error(cause)
            ctx.response.body = "Oops, grpc error"
            ctx.response.status = oak.Status.InternalServerError
        }
    }

    return middleware

}



function setResponse(ctx: oak.Context, response: UniversalServerResponse) {
    ctx.response.status = response.status
    if (response.header) {
        ctx.response.headers = response.header
    }
    ctx.response.body = response.body
    if (response.trailer) {
        // TODO: Support this when necessary:
        console.warn("Received trailers:", response.trailer)
    }
}

function universalRequest(ctx: oak.Context): UniversalServerRequest {
    const req = ctx.request
    return {
        url: req.url,
        header: req.headers, 
        method: req.method,
        body: readChunks(req),

        // TODO: How do we detect HTTP 2 in Oak?
        // See: https://github.com/oakserver/oak
        httpVersion: "1.1", 
    }
}

async function * readChunks(req: oak.Request, size = 1024): AsyncIterable<Uint8Array> {
    const reader = req.body({type: "reader"}).value
    while (true) {
        const buf = new Uint8Array(size)
        const n = await reader.read(buf)
        if (n === null) {
            return
        }
        yield buf.slice(0, n)
    }
}

