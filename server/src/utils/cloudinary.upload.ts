
import { v2 as cloudinary } from "cloudinary"

import fs from "node:fs"

const CLOUDINARY_NAME = process.env.CLOUDINARY_CLOUD_NAME as string
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string



cloudinary.config( {
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
} )

const cloudinaryUpload = async ( filePath: string | undefined ) =>
{
    if ( !filePath )
    {
        return null
    }
    try
    {
        const response =await cloudinary.uploader
            .upload( filePath, {
                resource_type: "auto",
            } )
        fs.unlinkSync( filePath )
        return  await response.url
    } catch ( error )
    {
        if ( error instanceof Error )
        {
            console.error( error.message )
            fs.unlinkSync( filePath )
        } else
        {
            console.error( error );
        }
        return null
    }
}

export { cloudinaryUpload }