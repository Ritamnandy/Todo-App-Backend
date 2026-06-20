
import { Worker } from "bullmq";
import { sendVerifyEmailMail } from "../utils/mail.js";


const emailWorker = new Worker( "email-send", async ( job ) =>
{
    if ( job.name === "verify-send" )
    {
        const { email, userName, varificationCode } = job.data
        await sendVerifyEmailMail( email, userName, varificationCode )
    }
} )

emailWorker.on( "completed", ( job ) =>
{
    console.log( "Email sent successfully", job.id, job.data )
} )

emailWorker.on( "failed", ( job, err ) =>
{
    console.log( "Email sending failed", job?.failedReason )
    console.error( err )
} )