
import { Worker } from "bullmq";
import { sendVerifyEmailMail, forgotPasswordMail } from "../utils/mail.js";

const connection = {
    host: process.env.REDIS_HOST as string,
    port: Number( process.env.REDIS_PORT ),
}

const emailWorker = new Worker( "email-send", async ( job ) =>
{
    console.log( "Email worker started...", job.id );
    if ( job.name === "verify-send" )
    {
        const { email, userName, varificationCode } = job.data
        await sendVerifyEmailMail( email, userName, varificationCode )
    }
}, { connection } )

emailWorker.on( "completed", ( job ) =>
{
    console.log( "Email sent successfully", job.id, job.data )
} )

emailWorker.on( "failed", ( job, err ) =>
{
    console.log( "Email sending failed", job?.failedReason )
    console.error( err )
} )