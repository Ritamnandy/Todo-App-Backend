
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import compression from "compression"
import session from "express-session"
import requestIp from "request-ip"
import passport from "passport"

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
app.use( session( {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true
} ) )
app.use( passport.initialize() )
app.use( passport.session() )




export { app }