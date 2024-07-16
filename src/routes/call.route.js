import express from "express";

import { MakeACall, GetACall } from "../controllers/call.controller.js";// 'controllers/call.controller.js';
//"../controllers/call.controller.js";



let callRouter = express.Router();


callRouter.post("/make_a_call", MakeACall);
callRouter.get("/get_a_call", GetACall);


export default callRouter 