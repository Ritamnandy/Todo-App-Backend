
import passport from "passport";
import { User } from "../models/user.models.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20"


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string
        },
        async ( _, __, profile: Profile, done: VerifyCallback ) =>
        {
            try
            {
                if ( !profile )
                {
                    throw new Error( "Profile not found" )
                }
                console.log( profile );

            } catch ( error )
            {
                console.error( error );
            }
        }
    )
)

// passport.serializeUser( ( user, done ) =>
// {
//     done( null, user._id )
// } )

// passport.deserializeUser(async ( user, done ) =>
// {
//     try
//     {
//         done( null, user )
//     } catch ( error )
//     {
//         console.error( error );
//     }
// } )