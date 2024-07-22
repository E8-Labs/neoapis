import express from 'express'
import { LoginUser, InviteUser } from '../controllers/user.controller.js'
import verifyJwtToken from '../middleware/jwtmiddleware.js';



let UserRouter = express.Router()


UserRouter.post("/login", LoginUser);
UserRouter.post("/invite_user", verifyJwtToken, InviteUser);


export default UserRouter
