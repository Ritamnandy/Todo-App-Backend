
import mongoose from "mongoose";
import type { Document, Types } from "mongoose"

export interface ITodo extends Document
{
    content: string
    isCompleted: boolean
    createdBy: Types.ObjectId
    subTodos: Types.ObjectId[]
}

const todoSchema = new mongoose.Schema<ITodo>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        subTodos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubTodo"
            }
        ]

    },
    {
        timestamps: true
    }
)

export const Todo = mongoose.model<ITodo>( "Todo", todoSchema )