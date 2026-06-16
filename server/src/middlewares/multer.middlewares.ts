
import multer from "multer";

const Storage = multer.diskStorage( {
    destination: ( req, file, cb ) =>
    {
        cb( null, "src/public/temp/" )
    },
    filename: ( req, file, cb ) =>
    {
        cb( null, file.originalname )
    }
} )

export const upload = multer( { storage: Storage } )