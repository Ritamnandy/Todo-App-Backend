
import { body, param } from "express-validator"



export const registerValidator = () =>
{
    return [
        body( 'firstname' )
            .trim()
            .notEmpty()
            .withMessage( 'firstname is required' )
            .isString()
            .withMessage( 'firstname must be a string' ),
        body( 'lastname' )
            .trim()
            .notEmpty()
            .withMessage( 'lastname is required' )
            .isString()
            .withMessage( 'lastname must be a string' ),
        body( 'email' )
            .trim()
            .notEmpty()
            .withMessage( 'email is required' )
            .isEmail()
            .withMessage( 'email must be a valid email' ),
        body( 'password' )
            .trim()
            .notEmpty()
            .withMessage( 'password is required' )
            .isString()
            .withMessage( 'password must be a string' ),
    ]
}

export const loginValidator = () =>
{
    return [
        body( 'email' )
            .trim()
            .notEmpty()
            .withMessage( 'email is required' )
            .isEmail()
            .withMessage( 'email must be a valid email' ),
        body( 'password' )
            .trim()
            .notEmpty()
            .withMessage( 'password is required' )
            .isString()
            .withMessage( 'password must be a string' ),
    ]
}