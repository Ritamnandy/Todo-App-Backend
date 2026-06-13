
import nodemailer from "nodemailer"
import Mailgen from "mailgen"

const sendVerifyEmailMail = async ( userEmail: string, userName: string, varificationCode: string ) =>
{
    const transporter = nodemailer.createTransport( {
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    } );
    const mailGanerator = new Mailgen( {
        theme: "default",
        product: {
            name: "ToDo App",
            link: "https://todo-app-frontend.vercel.app/",
        },
    } );
    const email = {
        body: {
            name: userName,
            intro: "Welcome to Blog App! We're very excited to have you on board.",
            action: {
                instructions: "To verify your account, Use this code:",
                button: {
                    color: "#bc621d",
                    text: varificationCode.toString(),
                    link: "#",
                },
            },
            outro: "Code will expire in 5 minutes.\nNeed help, or have questions? Just reply to this email, we\'d love to help.",
        },
    };

    const emailBody = mailGanerator.generate( email );
    const emailText = mailGanerator.generatePlaintext( email );
    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Todo App - Email Verification",
        html: emailBody,
        text: emailText,
    }
    try
    {

        await transporter.sendMail( mailOptions );
        console.log( "mail send" );

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            console.error( error.message )
        } else
        {
            console.error( error );
        }
    }
}

const forgotPasswordMail = async ( userEmail: string, userName: string, varificationCode: string ) =>
{
    const transporter = nodemailer.createTransport( {
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    } );
    const mailGanerator = new Mailgen( {
        theme: "default",
        product: {
            name: "ToDo App",
            link: "https://todo-app-frontend.vercel.app/",
        },
    } );
    const email = {
        body: {
            name: userName,
            intro: "Welcome to Blog App! We're very excited to have you on board.",
            action: {
                instructions: "To Reset your password, Use this code:",
                button: {
                    color: "#1dbc52",
                    text: varificationCode.toString(),
                    link: "#",
                },
            },
            outro: "Code will expire in 5 minutes.\nNeed help, or have questions? Just reply to this email, we\'d love to help.",
        },
    };

    const emailBody = mailGanerator.generate( email );
    const emailText = mailGanerator.generatePlaintext( email );
    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Todo App - Email Verification",
        html: emailBody,
        text: emailText,
    }
    try
    {

        await transporter.sendMail( mailOptions );
        console.log( "forgot password email send" );

    } catch ( error )
    {
        if ( error instanceof Error )
        {
            console.error( error.message )
        } else
        {
            console.error( error );
        }
    }
}


export { sendVerifyEmailMail, forgotPasswordMail }