
import mongoose from "mongoose";
import type { Document, Types } from "mongoose"

export interface ISubTodo extends Document
{
    content: string;
    isCompleted: boolean;
    todo: Types.ObjectId;
    createdBy: Types.ObjectId;
}



const subTodoSchema = new mongoose.Schema<ISubTodo>(
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
        todo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Todo",
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const SubTodo = mongoose.model<ISubTodo>( "SubTodo", subTodoSchema )