// import 'module-alias/register.js';
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodeCron from 'node-cron'

import db from './src/models/index.js';

// import callRouter from './src/routes/call.route.js';
import UserRouter from './src/routes/user.route.js'
import ChatRouter from './src/routes/chat.route.js';

dotenv.config();


const app = express()
app.use(cors())
app.use(express.json())


app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
  });
  
  app.use(cors({
    origin: 'https://neoai-ebon.vercel.app/onboarding',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  // Parse JSON bodies
//   app.use(express.json());
  
  // Manually handle preflight requests
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://neoai-ebon.vercel.app/onboarding');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });




db.sequelize.sync({alter: true})

// app.use("/api/user", callRouter);
app.use("/api/user", UserRouter);
app.use("/api/chat", ChatRouter);






import { GetACall } from './src/controllers/call.controller.js';



// every two minutes
// const job = nodeCron.schedule('*/1 * * * *', getCallsAndDetails);

// job.start();


const server = app.listen(process.env.Port, () => {
    console.log("Started listening on " + process.env.Port);
})