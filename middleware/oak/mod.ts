/**
 * [Buf Connect] middleware for Oak.
 * 
 * Developed by following the pattern here:
 * <https://github.com/bufbuild/connect-es/blob/main/packages/connect-express/src/express-connect-middleware.ts>
 * 
 * @module
 */

import type { ConnectRouter, ConnectRouterOptions } from "../../bufbuild/connect.ts"
import type { UniversalHandler, UniversalServerRequest, UniversalServerResponse } from "../../bufbuild/connect/protocol.ts"
import * as oak from "./_deps/oak.ts"

export interface Options extends ConnectRouterOptions {
    /**
     * A function to register your service(s) routes.
     */
    routes: (router: ConnectRouter) => void,

    /**
     * A builder function for the router to use for this middleware.
     * 
     * You can just pass this in from `@bufbuild/connect`.
     * 
     * This lets you upgrade bufbuild independently from this middleware.
     * (Well, as long as the interface doesn't change.)

     */
    createConnectRouter: (opts?: ConnectRouterOptions) => ConnectRouter
}

export function middleware(
    options: Options
): oak.Middleware {
    const router = options.createConnectRouter()
    options.routes(router)

    // Associate handlers by path:
    const handlers = new Map<string, UniversalHandler>()
    for (const handler of router.handlers) {
        handlers.set(handler.requestPath, handler)
    }

    const middleware = async (ctx: oak.Context, next: () => Promise<unknown>) => {
        const req = ctx.request
        const path = req.url.pathname
        const handler = handlers.get(path)
        if (!handler) {
            return next()
        }

        try {
            const response = await handler(universalRequest(ctx))
            setResponse(ctx, response)
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
        // TODO: Support this when we support HTTP/2.
        console.warn("Received trailers (unsupported):", response.trailer)
    }
}

function universalRequest(ctx: oak.Context): UniversalServerRequest {
    const req = ctx.request
    return {
        url: req.url,
        header: req.headers, 
        method: req.method,
        body: readChunks(req),

        // TODO: How do we detect/use HTTP 2 in Oak?
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

