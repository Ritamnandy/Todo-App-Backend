
import type { Request, Response } from "express";
import { User } from "../models/user.models.js";
import type { IUser } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { cloudinaryUpload } from "../utils/cloudinary.upload.js";
import { sendVerifyEmailMail, forgotPasswordMail } from "../utils/mail.js";
import jwt from "jsonwebtoken"
import type { Secret, JwtPayload } from "jsonwebtoken"
import { loginType } from "../constants.js";
import { redis } from "../db/redis.db.js";


const generateOtp = (): string =>
{
    return Math.floor( 100000 + Math.random() * 900000 ).toString();
}

function getOtpKey ( email: string ): string
{
    return `otp:${ email }`
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
    password: string,
    logintype: loginType
}

const registerUser = asyncHandler( async ( req, res ) =>
{
    const { firstname, lastname, email, password } = req.body as registerUserBody
    if ( !firstname || !lastname || !email || !password )
    {
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    if ( firstname === "" || lastname === "" || email === "" || password === "" )
    {
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( user )
    {
        return res.json( new ApiError( 400, "User already exists", [ "User already exists" ] ) )
    }

    const otp: string = generateOtp()
    await redis.set( getOtpKey( email ), otp, "EX", 60 * 5 )
    const userName = `${ firstname } ${ lastname }`
    await sendVerifyEmailMail( email, userName, otp )
    const createdUser: IUser = await User.create( {
        firstname,
        lastname,
        email,
        password,
        loginType: loginType.EMAIL_PASSWORD
    } )
    if ( !createdUser )
    {
        return res.json( new ApiError( 500, "User not created", [ "User not created" ] ) )
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
        return res.json( new ApiError( 400, "Email is required", [ "Email is required" ] ) )
    }
    if ( email === "" )
    {
        return res.json( new ApiError( 400, "Email is required", [ "Email is required" ] ) )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( !user )
    {
        return res.json( new ApiError( 404, "User not found", [ "User not found" ] ) )
    }
    const otp: string = generateOtp()
    await redis.set( getOtpKey( email ), otp, "EX", 60 * 5 )
    const userName = `${ user.firstname } ${ user.lastname }`
    await sendVerifyEmailMail( email, userName, otp )
    await user.save( { validateBeforeSave: false } )
    res.status( 200 )
        .json( new ApiResponse( 200, "Email sent successfully", [ "Email sent successfully, check your email to verify your account" ] ) )
} )

/// ++++ verify nigga lol ++++

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
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    if ( email === "" || code === "" )
    {
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( !user )
    {
        return res.json( new ApiError( 404, "User not found", [ "User not found" ] ) )
    }
    if ( user.isVerified )
    {
        return res.json( new ApiError( 400, "User already verified", [ "User already verified" ] ) )
    }
    const otp: string | null = await redis.get( getOtpKey( email ) )
    if ( !otp )
    {
        return res.json( new ApiError( 400, "Invalid code or code has expired", [ "Invalid code or code has expired" ] ) )
    }
    if ( otp !== code )
    {
        return res.json( new ApiError( 400, "Invalid code or code has expired", [ "Invalid code or code has expired" ] ) )
    }
    await redis.del( getOtpKey( email ) )
    user.isVerified = true
    const { accessToken, refreshToken } = await generateTokenPair( user )
    await user.save( { validateBeforeSave: false } )
    if ( !accessToken || !refreshToken )
    {
        return res.json( new ApiError( 500, "Token not generated", [ "Token not generated" ] ) )
    }
    const createdUser: IUser | null = await User.findById( user._id ).select( "-password -verificationCode -verificationCodeExpiry -refreshToken -googleId -isVerified" )
    if ( !createdUser )
    {
        return res.json( new ApiError( 404, "User not found", [ "User not found" ] ) )
    }
    res.status( 200 )
        .cookie( "accessToken", accessToken, Options )
        .cookie( "refreshToken", refreshToken, Options )
        .json( new ApiResponse( 200, "User verified successfully", [ "User verified successfully", { accessToken: accessToken, refreshToken: refreshToken, user: createdUser } ] ) )
} )


// +++++ login user ++++++
interface loginUserBody
{
    email: string,
    password: string
}


const loginUser = asyncHandler( async ( req, res ) =>
{
    const { email, password } = req.body as loginUserBody
    if ( !email || !password )
    {
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    if ( email === "" || password === "" )
    {
        return res.json( new ApiError( 400, "All fields are required", [ "All fields are required" ] ) )
    }
    const user: IUser | null = await User.findOne( { email } )
    if ( !user )
    {
        return res.json( new ApiError( 404, "User not found", [ "User not found" ] ) )
    }
    if ( !user.isVerified )
    {
        return res.json( new ApiError( 400, "User not verified", [ "User not verified" ] ) )
    }
    const isMatch = user.comparePassword( password )
    if ( !isMatch )
    {
        return res.json( new ApiError( 400, "Invalid credentials", [ "Invalid credentials" ] ) )
    }
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        return res.json( new ApiError( 500, "Token not generated", [ "Token not generated" ] ) )
    }
    const createdUser: IUser | null = await User.findById( user._id ).select( "-password -verificationCode -verificationCodeExpiry -refreshToken -googleId -isVerified" )
    if ( !createdUser )
    {
        return res.json( new ApiError( 404, "User not found", [ "User not found" ] ) )
    }
    res.status( 200 )
        .cookie( "accessToken", accessToken, Options )
        .cookie( "refreshToken", refreshToken, Options )
        .json( new ApiResponse( 200, "User logged in successfully", [ "User logged in successfully", { accessToken: accessToken, refreshToken: refreshToken, user: createdUser } ] ) )
} )



// +++ logout user +++++

const logoutUser = asyncHandler( async ( req, res ) =>
{
    const user: IUser | null = req.user as IUser
    if ( !user )
    {
        return res.json( new ApiError( 401, "Unauthorized request", [ "Unauthorized request,\tUser not found" ] ) )
    }
    user.refreshToken = " "
    await user.save( { validateBeforeSave: false } )
    res.status( 200 )
        .clearCookie( "accessToken" )
        .clearCookie( "refreshToken" )
        .json( new ApiResponse( 200, "User logged out successfully", [ "User logged out successfully" ] ) )
} )


//  +++++ set avatar ++++++



const setAvatar = asyncHandler( async ( req, res ) =>
{
    const user: IUser | null = req.user as IUser;
    const imageLocalPath: string | undefined = req.file?.path;
    console.log( imageLocalPath );

    if ( !imageLocalPath )
    {
        return res.json( new ApiError( 400, "Image not found", [ "Image is required" ] ) )
    }
    if ( !user )
    {
        return res.json( new ApiError( 401, "Unauthorized request", [ "Unauthorized request,\tUser not found" ] ) )
    }
    const avatar = await cloudinaryUpload( imageLocalPath )
    if ( !avatar )
    {
        return res.json( new ApiError( 500, "Image not uploaded", [ "Image not uploaded" ] ) )
    }
    user.avatar = avatar
    await user.save( { validateBeforeSave: false } )
    res.status( 200 )
        .json( new ApiResponse( 200, "Image uploaded successfully", [ "Image uploaded successfully", { avatar: avatar } ] ) )
} )

// +++++ refresh access token +++++

interface refreshTokenBody
{
    refreshToken: string
}
interface CustomJwtPayload extends JwtPayload
{
    _id: string,
    email: string,
}
const refreshAccessToken = asyncHandler( async ( req, res ) =>
{
    const { refreshToken: Token } = ( req.body || req.cookies || req.headers ) as refreshTokenBody
    if ( !Token )
    {
        return res.json( new ApiError( 401, "Token not found", [ "Token not found" ] ) )
    }
    const decoded = jwt.verify( Token, process.env.REFRESH_TOKEN_SECRET as Secret ) as CustomJwtPayload
    const user = await User.findById( decoded?._id )
    if ( !user )
    {
        return res.json( new ApiError( 401, "Unauthorized request", [ "Unauthorized request,\tUser not found" ] ) )
    }
    const { accessToken, refreshToken } = await generateTokenPair( user )
    if ( !accessToken || !refreshToken )
    {
        return res.json( new ApiError( 500, "Token not generated", [ "Token not generated" ] ) )
    }
    res.status( 200 )
        .cookie( "accessToken", accessToken, Options )
        .cookie( "refreshToken", refreshToken, Options )
        .json( new ApiResponse( 200, "Access token refreshed successfully", [ "Access token refreshed successfully", { accessToken: accessToken, refreshToken: refreshToken } ] ) )
} )


// ++++ social login +++++++

const socialLogin = asyncHandler( async ( req, res ) =>
{
    res.send( "social login" )
} )
























// +++++++ forget password +++++++

const forgetPassword = asyncHandler( async ( req, res ) =>
{
    res.send( "forget password" )
} )




export
{
    registerUser,
    resendVerificationCode,
    verifyEmail,
    loginUser,
    logoutUser,
    setAvatar,
    forgetPassword,
    refreshAccessToken,
    socialLogin
}