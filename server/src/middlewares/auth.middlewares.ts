
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import type { Secret, JwtPayload } from "jsonwebtoken"
import { User } from "../models/user.models.js";

interface CustomJwtPayload extends JwtPayload
{
    _id: string,
    email: string,
    firstname: string,
    lastname: string
}

const verifyJWT = asyncHandler( async ( req, res, next ) =>
{
    try
    {
        const token = req.cookies.accessToken || req.header( "Authorization" )?.replace( " Bearer ", " " ) as string
        if ( !token )
        {
            throw new ApiError( 401, "Unauthorized request", [ "Access token not found" ] )
        }
        const { _id: id } = jwt.verify( token, process.env.JWT_TOKEN_SECRET as Secret ) as CustomJwtPayload
        const user = await User.findById( id ).select( "-password -verificationCode -verificationCodeExpiry -refreshToken -googleId -isVerified" )

        if ( !user )
        {
            throw new ApiError( 400, "Unauthorized request", [ "user not found", "Invalid access token" ] )
        }
        req.user = user

        next()

    } catch ( error )
    {
        next( error )
    }
} )

export { verifyJWT }