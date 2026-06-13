
import type { Request, Response, NextFunction } from "express";

type Handler = (
    req: Request,
    res: Response,
    next?: NextFunction
) => Promise<unknown>;

export const asyncHandler = ( requestHandler: Handler ) =>
{
    return ( req: Request, res: Response, next: NextFunction ): void =>
    {
        Promise.resolve( requestHandler( req, res, next ) ).catch( next );
    };
}

