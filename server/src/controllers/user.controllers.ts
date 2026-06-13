
import { User } from "../models/user.models.js";
import type { IUser } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.upload.js";
import { sendVerifyEmailMail, forgotPasswordMail } from "../utils/mail.js";
import crypto from "node:crypto"

const generateVerificationCode = (): string =>
{
    return crypto.randomBytes( 3 ).toString( "hex" );
}
const getExpiryTime = (): Date =>
{
    const date = new Date()
    date.setMinutes( date.getMinutes() + 5 )
    return date
}
const generateTokenPair = async ( Id: IUser ):
    Promise<{ accessToken: string | null, refreshToken: string | null }> =>
{
    try
    {
        const user: IUser | null = await User.findById( Id._id )
        if ( user )
        {
            const accessToken = user.generateAccessToken()
            const refreshToken = user.generateRefreshToken()
            user.refreshToken = refreshToken
            await user.save( { validateBeforeSave: false } )
            return { accessToken, refreshToken }
        } else
        {
            return { accessToken: null, refreshToken: null }
        }
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            throw new ApiError( 500, error.message )
        } else
        {
            throw new ApiError( 500, `not generate token pair:-  ${ error }` )
        }
    }
}

const Options = {
    httpOnly: true,
    expires: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000 ),
    secure: true,
}

///++++++ register user +++++++

interface registerUserBody
{
    firstname: string,
    lastname: string,
    email: string,
    password: string
}

const registerUser = asyncHandler( async ( req, res ) =>
{
    const { firstname, lastname, email, password } = req.body as registerUserBody
    if ( !firstname || !lastname || !email || !password )
    {
        throw new ApiError( 400, "All fields are required", [ "All fields are required" ] )
    }
    if ( firstname === "" || lastname === "" || email === "" || password === "" )
    {
        throw new ApiError( 400, "All fields are required", [ "All fields are required" ] )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( user )
    {
        throw new ApiError( 400, "User already exists", [ "User already exists" ] )
    }

    const verificationCode = generateVerificationCode()
    const verificationCodeExpiry = getExpiryTime()
    const userName = `${ firstname } ${ lastname }`
    await sendVerifyEmailMail( email, userName, verificationCode )
    const createdUser: IUser = await User.create( {
        firstname,
        lastname,
        email,
        password,
        verificationCode,
        verificationCodeExpiry,
    } )
    if ( !createdUser )
    {
        throw new ApiError( 500, "User not created", [ "User not created" ] )
    }
    res.status( 201 )
        .json( new ApiResponse( 201, "User created successfully", [ "User created successfully, check your email to verify your account" ] ) )
} )

/// ++++++ resend email +++++++
interface resendEmailBody
{
    email: string
}
const resendVerificationCode = asyncHandler( async ( req, res ) =>
{
    const { email } = req.body as resendEmailBody
    if ( !email )
    {
        throw new ApiError( 400, "Email is required", [ "Email is required" ] )
    }
    if ( email === "" )
    {
        throw new ApiError( 400, "Email is required", [ "Email is required" ] )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( !user )
    {
        throw new ApiError( 404, "User not found", [ "User not found" ] )
    }
    const verificationCode = generateVerificationCode()
    const verificationCodeExpiry = getExpiryTime()
    const userName = `${ user.firstname } ${ user.lastname }`
    await sendVerifyEmailMail( email, userName, verificationCode )
    user.verificationCode = verificationCode
    user.verificationCodeExpiry = verificationCodeExpiry
    await user.save( { validateBeforeSave: false } )
    res.status( 200 )
        .json( new ApiResponse( 200, "Email sent successfully", [ "Email sent successfully, check your email to verify your account" ] ) )
} )

/// ++++ verify email ++++++

interface verifyEmailBody
{
    email: string,
    code: string
}

const verifyEmail = asyncHandler( async ( req, res ) =>
{
    const { email, code } = req.body as verifyEmailBody
    if ( !email || !code )
    {
        throw new ApiError( 400, "All fields are required", [ "All fields are required" ] )
    }
    if ( email === "" || code === "" )
    {
        throw new ApiError( 400, "All fields are required", [ "All fields are required" ] )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( !user )
    {
        throw new ApiError( 404, "User not found", [ "User not found" ] )
    }
    if ( user.isVerified )
    {
        throw new ApiError( 400, "User already verified", [ "User already verified" ] )
    }
    if ( user.verificationCode !== code )
    {
        throw new ApiError( 400, "Invalid verification code", [ "Invalid verification code" ] )
    }
    if ( user.verificationCodeExpiry === null )
    {
        throw new ApiError( 400, "Verification code expired", [ "Verification code expired" ] )
    }
    if ( user.verificationCodeExpiry < new Date() )
    {
        throw new ApiError( 400, "Verification code expired", [ "Verification code expired" ] )
    }
    user.isVerified = true
    user.verificationCode = ""
    user.verificationCodeExpiry = null
    await user.save( { validateBeforeSave: false } )
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        throw new ApiError( 500, "Token not generated", [ "Token not generated" ] )
    }
    const createdUser: IUser | null = await User.findById( user._id ).select( "-password -verificationCode -verificationCodeExpiry -refreshToken -googleId -isVerified" )
    if ( !createdUser )
    {
        throw new ApiError( 404, "User not found", [ "User not found" ] )
    }
    res.status( 200 )
        .cookie( "accessToken", accessToken, Options )
        .cookie( "refreshToken", refreshToken, Options )
        .json( new ApiResponse( 200, "User verified successfully", [ "User verified successfully", { accessT: accessToken, refreshT: refreshToken, user: createdUser } ] ) )
} )



export
{
    registerUser,
    resendVerificationCode,
    verifyEmail,
}