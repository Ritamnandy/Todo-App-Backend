
import express from "express"
import type { Request } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit, { ipKeyGenerator } from "express-rate-limit"
import compression from "compression"
import session from "express-session"
import requestIp from "request-ip"
import passport from "passport"
import "./jobs/worker.jobs.js"
import "./passport/oauth.js"
import { ApiError } from "./utils/apierror.js"


const app = express()

app.use( cors( {
    origin: process.env.CORS_ORIGIN,
    credentials: true
} ) )

app.use( express.json( { limit: "20kb" } ) )
app.use( express.urlencoded( { extended: true, limit: "20kb" } ) )
app.use( cookieParser() )
app.use( compression() )
app.use( requestIp.mw() )

const sessionSecret = process.env.SESSION_SECRET as string
if ( !sessionSecret ) throw new Error( "SESSION_SECRET is not defined" )

app.use( session( {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
} ) )

app.use( passport.initialize() )
app.use( passport.session() )
const limiter = rateLimit( {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    // use a loose type for req because request-ip augments the request with `clientIp`
    keyGenerator: ( req: Request ) =>
    {
        return ipKeyGenerator( req.clientIp ?? req.ip as string )
    },
    handler: ( req, res ) => res.status( 429 ).json( new ApiError( 429, "Too many requests", [ "Too many requests" ] ) ) // return rate limit info in the `RateLimit-*` headers
} )

app.use( limiter )


import userRoute from "./routes/user.routes.js"

import todoRoute from "./routes/todo.routes.js"

app.use( "/api/v1/todos", todoRoute )

app.use( "/api/v1/auth", userRoute )





export { app }