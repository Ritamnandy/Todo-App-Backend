
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const envPath = fileURLToPath( new URL( "../../.env", import.meta.url ) )

dotenv.config( {
    path: envPath,
    quiet: true
} )

