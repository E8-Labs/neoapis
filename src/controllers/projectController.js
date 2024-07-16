// src/controllers/projectController.js
import ProjectResource from '../resources/projectresource.js';
import db from '../models/index.js';
import JWT from "jsonwebtoken";
// const Project = db.Project;
// const Chat = db.Chat;

const createProject = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            try {
                const { appIdea, targettedAudience, projectName } = req.body;
                const project = await db.Project.create({
                  appIdea,
                  targettedAudience,
                  projectName,
                  userId: authData.user.id
                });
                // Create a chat for the project
                const chat = await db.Chat.create({ projectId: project.id });
            
                res.status(201).json({ status: true, message: "Project created", data: await ProjectResource(project)});
              } catch (error) {
                res.status(500).json({ error: 'Server Error', status: false, message: error.message });
              }
        }
        else{
            res.status(500).json({ error: 'Unauthenticated user', status: false, message: "Unauthenticated user" });
        }
    })
  
};



const getUserProjects = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            try {
                
                let projects = await db.Project.findAll({
                    where: {
                        userId: authData.user.id
                    }
                })
            
                res.status(201).json({ status: true, message: "Project created", data: await ProjectResource(projects)});
              } catch (error) {
                res.status(500).json({ error: 'Server Error', status: false, message: error.message });
              }
        }
        else{
            res.status(500).json({ error: 'Unauthenticated user', status: false, message: "Unauthenticated user" });
        }
    })
  
};

export {createProject, getUserProjects}
