
import passport from "passport";
import { User, type IUser } from "../models/user.models.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20"
import { loginType } from "../constants.js";


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
                const email = profile._json.email as string
                const firstname = profile._json.given_name as string
                const lastname = profile._json.family_name as string
                const avatar = profile._json.picture as string
                const Verified = profile._json.email_verified as boolean

                const user = await User.findOne( { email } )
                if ( user )
                {
                    return done( null, user as IUser )
                }
                const createdUser = await User.create(
                    {
                        email,
                        firstname,
                        lastname,
                        avatar,
                        loginType: loginType.GOOGLE,
                        googleId: profile.id as string,
                        isVerified: Verified
                    }
                )
                if ( !createdUser )
                {
                    throw new Error( "User not created" )
                }
                return done( null, createdUser as IUser )
            } catch ( error )
            {
                console.error( error );
                return done( error as Error, undefined );
            }
        }
    )
)

passport.serializeUser( ( user, done ) =>
{
    done( null, ( user as IUser )._id )
} )

passport.deserializeUser( async ( id, done ) =>
{
    try
    {
        const user = await User.findById( id ).select( "-password -refreshToken -googleId " )
        if ( user )
        {
            return done( null, user as IUser )
        }
        return done( "user not found", undefined )
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            return done( error.message, undefined )
        } else
        {
            return done( "User not found", undefined )
        }
    }
} )