

import "./config/env.config.js"
import { app } from "./app.js"
import { connectDB } from "./db/connect.db.js"

const PORT = process.env.PORT || 5000


connectDB().then( () =>
{
    app.listen( PORT, () =>
    {
        console.log( `Server is running on port ${ PORT }` )
    } )
} ).catch( ( error ) =>
{
    console.error( error )
} )

