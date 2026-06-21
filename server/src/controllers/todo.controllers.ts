
import { Todo } from "../models/todo.models.js";
import type { ITodo } from "../models/todo.models.js";
import { SubTodo } from "../models/sub_todo.models.js";
import type { ISubTodo } from "../models/sub_todo.models.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import type { IUser } from "../models/user.models.js";


// add todos title

const addTodoTitle = asyncHandler( async ( req, res ) =>
{

    const { title, color } = req.body as ITodo
    const user: IUser | null = req.user as IUser
    if ( !title || !color )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    if ( title === "" || color === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "User not found" ] ) )
    }
    const createdTodo: ITodo | null = await Todo.create( { title, color, createdBy: user._id } )
    if ( !createdTodo )
    {
        return res.status( 500 ).json( new ApiError( 500, "Todo not created", [ "Todo not created" ] ) )
    }
    return res.status( 201 ).json( new ApiResponse( 201, "Todo created successfully", [ "Todo created successfully", { todo: createdTodo } ] ) )
} )


/// update todo title

const updateTodoTitle = asyncHandler( async ( req, res ) =>
{
    const todoId: string = req.params.id as string
    const { title, color } = req.body as ITodo
    if ( !todoId || todoId === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Todo id is required", [ "Todo id is required" ] ) )
    }
    if ( !title && !color )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    if ( title === "" && color === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    let updatedTodo: ITodo | null = null
    if ( title )
    {
        updatedTodo = await Todo.findOneAndUpdate( { _id: todoId }, { title } )
    }
    if ( color )
    {
        updatedTodo = await Todo.findOneAndUpdate( { _id: todoId }, { color } )
    }

    if ( !updatedTodo )
    {
        return res.status( 404 ).json( new ApiError( 404, "Todo not found", [ "Todo not found" ] ) )
    }
    return res.status( 200 ).json( new ApiResponse( 200, "Todo updated successfully", [ "Todo updated successfully", { todo: updatedTodo } ] ) )
} )

// delete todo title

const deleteTodoTitle = asyncHandler( async ( req, res ) =>
{
    const todoId: string = req.params.id as string
    const user: IUser | null = req.user as IUser
    if ( !todoId || todoId === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Todo id is required", [ "Todo id is required" ] ) )
    }
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "User not found" ] ) )
    }
    await Todo.findOneAndDelete( { _id: todoId } )
    return res.status( 200 ).json( new ApiResponse( 200, "Todo deleted successfully", [ "Todo deleted successfully" ] ) )
} )

/// complete todo title

const completeTodoTitle = asyncHandler( async ( req, res ) =>
{
    const todoId: string = req.params.id as string
    const { isCompleted } = req.body
    if ( !todoId || todoId === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Todo id is required", [ "Todo id is required" ] ) )
    }
    if ( !isCompleted || isCompleted === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "isCompleted is required", [ "isCompleted is required" ] ) )
    }
    const updatedTodo: ITodo | null = await Todo.findOneAndUpdate( { _id: todoId }, { isCompleted } )
    if ( !updatedTodo )
    {
        return res.status( 404 ).json( new ApiError( 404, "Todo not found", [ "Todo not found" ] ) )
    }
    return res.status( 200 ).json( new ApiResponse( 200, "Todo completed successfully", [ "Todo completed successfully", { todo: updatedTodo } ] ) )
} )


// add sub todo 

const addSubTodo = asyncHandler( async ( req, res ) =>
{
    const todoId: string = req.params.id as string
    const { content } = req.body as ISubTodo
    const user: IUser | null = req.user as IUser
    if ( !todoId || todoId === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Todo id is required", [ "Todo id is required" ] ) )
    }
    if ( !content || content === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    if ( !user )
    {
        return res.status( 401 ).json( new ApiError( 401, "Unauthorized request", [ "User not found" ] ) )
    }
    const createdSubTodo: ISubTodo | null = await SubTodo.create( { content, todo: todoId, createdBy: user._id } )

    if ( !createdSubTodo )
    {
        return res.status( 500 ).json( new ApiError( 500, "Sub todo not created", [ "Sub todo not created" ] ) )
    }
    return res.status( 201 ).json( new ApiResponse( 201, "Sub todo created successfully", [ "Sub todo created successfully", { subTodo: createdSubTodo } ] ) )


} )

// update sub todo

const updateSubTodo = asyncHandler( async ( req, res ) =>
{
    const subTodId: string = req.params.id as string
    const { content } = req.body as ISubTodo
    if ( !content || content === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Title and color are required", [ "Title and color are required" ] ) )
    }
    const updatedSubTodo: ISubTodo | null = await SubTodo.findOneAndUpdate( { _id: subTodId }, { content } )
    if ( !updatedSubTodo )
    {
        return res.status( 404 ).json( new ApiError( 404, "Sub todo not found", [ "Sub todo not found" ] ) )
    }
    return res.status( 200 ).json( new ApiResponse( 200, "Sub todo updated successfully", [ "Sub todo updated successfully", { subTodo: updatedSubTodo } ] ) )
} )

// isCompleted sub todo

const completeSubTodo = asyncHandler( async ( req, res ) =>
{
    const subTodId: string = req.params.id as string
    const { isCompleted } = req.body
    if ( !isCompleted || isCompleted === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "isCompleted is required", [ "isCompleted is required" ] ) )
    }
    const updatedSubTodo: ISubTodo | null = await SubTodo.findOneAndUpdate( { _id: subTodId }, { isCompleted } )
    if ( !updatedSubTodo )
    {
        return res.status( 404 ).json( new ApiError( 404, "Sub todo not found", [ "Sub todo not found" ] ) )
    }
    return res.status( 200 ).json( new ApiResponse( 200, "Sub todo completed successfully", [ "Sub todo completed successfully", { subTodo: updatedSubTodo } ] ) )
} )


/// delete sub todo

const deleteSubTodo = asyncHandler( async ( req, res ) =>
{
    const subTodoId: string = req.params.id as string

    if ( !subTodoId || subTodoId === "" )
    {
        return res.status( 400 ).json( new ApiError( 400, "Sub todo id is required", [ "Sub todo id is required" ] ) )
    }
    await SubTodo.findOneAndDelete( { _id: subTodoId } )
    return res.status( 200 ).json( new ApiResponse( 200, "Sub todo deleted successfully", [ "Sub todo deleted successfully" ] ) )
} )


// get all  todos

const getAllTodo = asyncHandler( async ( req, res ) =>
{
    res.send( "get all todos" )
} )


export
{
    addTodoTitle,
    updateTodoTitle,
    deleteTodoTitle,
    completeTodoTitle,
    addSubTodo,
    updateSubTodo,
    completeSubTodo,
    deleteSubTodo,
    getAllTodo
}