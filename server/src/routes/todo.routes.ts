
import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

import
{
    addTodoTitle,
    updateTodoTitle,
    deleteTodoTitle,
    completeTodoTitle,
    addSubTodo,
    updateSubTodo,
    completeSubTodo,
    deleteSubTodo,
} from "../controllers/todo.controllers.js";


const router = express.Router();


router.route( "/add-todo-title" ).post( verifyJWT, addTodoTitle )
router.route( "/update-todo-title/:id" ).patch( verifyJWT, updateTodoTitle )
router.route( "/complete-todo-title/:id" ).patch( verifyJWT, completeTodoTitle )
router.route( "/delete-todo-title/:id" ).delete( verifyJWT, deleteTodoTitle )

router.route( "/add-sub-todo/:id" ).post( verifyJWT, addSubTodo )
router.route( "/update-sub-todo/:id" ).patch( verifyJWT, updateSubTodo )
router.route( "/complete-sub-todo/:id" ).patch( verifyJWT, completeSubTodo )
router.route( "/delete-sub-todo/:id" ).delete( verifyJWT, deleteSubTodo )



export default router