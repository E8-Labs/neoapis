import express from 'express'
import verifyJwtToken from '../middleware/jwtmiddleware.js';
import multer from 'multer';

const uploadFiles = multer().fields([
    { name: 'media', maxCount: 1 }
  ]);

import {sendMessage, getMessages} from '../controllers/chat.controller.js'
import {createProject, getUserProjects} from '../controllers/projectController.js'
let ChatRouter = express.Router()


ChatRouter.post("/send_message", verifyJwtToken, uploadFiles, sendMessage);
ChatRouter.get("/get_messages", verifyJwtToken, getMessages);
ChatRouter.post("/create_project", verifyJwtToken, createProject);
ChatRouter.get("/get_projects", verifyJwtToken, getUserProjects);


export default ChatRouter
