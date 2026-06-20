
import { Redis } from "ioredis";



const url = process.env.REDIS_URL as string

const redis = new Redis( url )

export { redis }