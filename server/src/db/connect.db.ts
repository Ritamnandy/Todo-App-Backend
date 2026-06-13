
import mongoose from "mongoose";
import { db_Name } from "../constants.js";

export const connectDB = async () =>
{
    try
    {
        const response = await mongoose.connect( `${ process.env.MONGODB_URL }/${ db_Name }` )
        console.log( "MongoDB is connected host:- " + response.connection.host );

    } catch ( error )
    {
        throw error
    }
}