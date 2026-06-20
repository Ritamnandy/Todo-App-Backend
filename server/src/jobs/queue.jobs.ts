
import { Queue } from "bullmq"

// const connection: QueueOptions = {
//     host: process.env.REDIS_HOST as string,
//     port: Number( process.env.REDIS_PORT ),
//     maxRetriesPerRequest: null,
// }



export const emailQueue = new Queue( "email-send", )

