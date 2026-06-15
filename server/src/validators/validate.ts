import { validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/apierror.js"

export const validate = ( req: Request, res: Response, next: NextFunction ) =>
{
    const errors = validationResult( req )
    if ( errors.isEmpty() )
    {
        return next()
    }
    let extractErrors: ( string | object )[] = []
    errors.array().map( ( err ) => extractErrors.push( { [ err.type ]: err.msg } ) )
    if ( !errors.isEmpty() )
    {
        return res.status( 422 ).json( new ApiError( 422, "Recived data is not valid", extractErrors ) )
    }
    next()
}

