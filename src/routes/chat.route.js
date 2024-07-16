import express from 'express'
import {sendMessage} from '../controllers/chat.controller.js'
import verifyJwtToken from '../middleware/jwtmiddleware.js';

import {createProject, getUserProjects} from '../controllers/projectController.js'
let ChatRouter = express.Router()


ChatRouter.post("/send_message", verifyJwtToken, sendMessage);
ChatRouter.post("/create_project", verifyJwtToken, createProject);
ChatRouter.get("/get_projects", verifyJwtToken, getUserProjects);


export default ChatRouter
