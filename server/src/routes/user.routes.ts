
import "../passport/oauth.js";
import express from "express";
import { validate } from "../validators/validate.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { registerValidator, loginValidator } from "../validators/auth/user.validators.js";
import
{
    registerUser,
    resendVerificationCode,
    verifyEmail,
    loginUser,
    logoutUser,
    setAvatar,
    forgetPassword,
    refreshAccessToken,
    socialLogin,
    getCurrentUser
} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js";
import passport from "passport";


const router = express.Router()

// google routes

router.route( '/google' ).get(
    passport.authenticate(
        'google',
        {
            scope: [ 'email', 'profile' ]
        }
    )
)

router.route( '/google/callback' ).get(
    passport.authenticate( 'google',
        {
            failureRedirect: '/login'
        }
    ), socialLogin
)


//public routes

router.route( "/register" ).post( registerValidator(), validate, registerUser )
router.route( "/resend-verification-code" ).post( resendVerificationCode )
router.route( "/verify-email" ).post( verifyEmail )
router.route( "/login" ).post( loginValidator(), validate, loginUser )
router.route( "/refresh-access-token" ).post( refreshAccessToken )
router.route( "/forget-password" ).post( forgetPassword )


//secure routes

router.route( "/logout" ).post( verifyJWT, logoutUser )
router.route( "/set-avatar" ).post( verifyJWT, upload.single( "avatar" ), setAvatar )
router.route( "/current-user" ).get( verifyJWT, getCurrentUser )


export default router