
import mongoose from "mongoose";
import type { Document, Types } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { Secret, SignOptions } from "jsonwebtoken"
import { loginType } from "../constants.js"

export interface IUser extends Document
{
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    googleId: string,
    verificationCode: string,
    verificationCodeExpiry: Date,
    isVerified: boolean,
    avatar: string,
    loginType: loginType,
    refreshToken: string,
    createdAt: Date,
    updatedAt: Date
}


const userSchema = new mongoose.Schema<IUser>(
    {
        firstname: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        lastname: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            trim: true,
            default: ""
        },
        googleId: {
            type: String,
            trim: true,
            default: ""
        },
        verificationCode: {
            type: String,
            trim: true,
            default: ""
        },
        verificationCodeExpiry: {
            type: Date,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        avatar: {
            type: String,
            trim: true,
            default: ""
        },
        loginType: {
            type: String,
            enum: loginType,
            required: true
        },
        refreshToken: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { timestamps: true }
);

userSchema.pre( "save", async function ()
{
    if ( !this.isModified( "password" ) ) return;
    this.password = await bcrypt.hash( this.password, 10 )
} )

userSchema.methods.comparePassword = async function ( password: string )
{
    return await bcrypt.compare( password, this.password )
}


userSchema.methods.generateAccessToken = function ()
{
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            loginType: this.loginType,
            isVerified: this.isVerified
        },
        process.env.JWT_TOKEN_SECRET as Secret,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN
        } as SignOptions
    )
}

userSchema.methods.generateRefreshToken = function ()
{
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.JWT_REFRESH_TOKEN_SECRET as Secret,
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN
        } as SignOptions
    )
}

export const User = mongoose.model<IUser>( "User", userSchema )