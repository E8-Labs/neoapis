import nodeCron from 'node-cron'
import db from "./src/models/index.js";
import { GetACall } from './src/controllers/call.controller.js';

async function getCallsAndDetails(){
    console.log("Running cron job")
    let calls = await db.CallModel.findAll({
        where:{
            [db.sequelize.Op.or]: [
                {status: {[db.sequelize.Op.ne]: "completed"}}
            ]
        }
    })
    console.log("Calls ", calls)
    if(calls && calls.length > 0){
        console.log("Pending calls found ")
        for(let i = 0; i < calls.length; i++){
            let callId = calls[i].callId;
            console.log("Getting call id ", callId);
            let data = GetACall(callId)
            console.log("Call fetched and updated ", data)
        }
    }
}

//every two min
const job = nodeCron.schedule('*/1 * * * *', getCallsAndDetails)

job.start();