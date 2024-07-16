import express from 'express'
import { LoginUser } from '../controllers/user.controller.js'



let UserRouter = express.Router()


UserRouter.post("/login", LoginUser);


export default UserRouter
