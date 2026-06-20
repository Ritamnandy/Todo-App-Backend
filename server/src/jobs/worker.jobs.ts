
import { Worker } from "bullmq";
import { sendVerifyEmailMail, forgotPasswordMail } from "../utils/mail.js";

const connection = {
    host: process.env.REDIS_HOST as string,
    port: Number( process.env.REDIS_PORT ),
}

const emailWorker = new Worker( "email-send", async ( job ) =>
{
    if ( job.name === "verify-send" )
    {
        const { email, userName, varificationCode } = job.data
        await sendVerifyEmailMail( email, userName, varificationCode )
    }
}, { connection } )
