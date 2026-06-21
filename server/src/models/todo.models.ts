
import mongoose from "mongoose";
import type { Document, Types } from "mongoose"

export interface ITodo extends Document
{
    title: string
    color:string
    isCompleted: boolean
    createdBy: Types.ObjectId
}

const todoSchema = new mongoose.Schema<ITodo>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
            default: "#000000"
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)

export const Todo = mongoose.model<ITodo>( "Todo", todoSchema )