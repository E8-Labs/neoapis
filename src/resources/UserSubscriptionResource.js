import db from "../models/index.js";
import { RetrieveASubscriptions } from "../services/stripe.js";

import moment from "moment-timezone";
// import { getRandomColor } from "../config/utility.js";
// import LoanStatus from "../../models/loanstatus.js";
// import PlaidTokenTypes from "../../models/plaidtokentypes.js";
// import UserLoanFullResource from "../loan/loan.resource.js";
const Op = db.Sequelize.Op;

const UserSubscriptionResource = async (plan) => {
    return await getUserData(plan);
}

async function getUserData(p) {
//console.log("Finding subs for " , p)
let sub = await RetrieveASubscriptions(p.subid || p.id);
if(!sub){
    //console.log("No subs for ", p.subid || p.id)
return null;
}
    const cancelAtPeriodEnd = sub.cancel_at_period_end;

    // Get the current period end date
    const currentPeriodEnd = sub.current_period_end;

    // Calculate remaining days
    const currentDate = Math.floor(Date.now() / 1000); // Current date in seconds
    const remainingDays = Math.ceil((currentPeriodEnd - currentDate) / (60 * 60 * 24)); // Convert seconds to days
    // //console.log("User have subscription plan", sub)
    sub.remainingDays = remainingDays;
    if (cancelAtPeriodEnd) {
        //console.log(`Subscription will end at the end of the current period. Remaining days: ${remainingDays}`);
    } else {
        //console.log('Subscription is active and set to auto-renew.');
    }
    sub.remainingDays = remainingDays;
    sub.trialStatus = sub.status === "trialing" ? "trialing" : "none"
    //console.log("Environment is ", process.env.Environment)
    if ((sub.livemode && process.env.Environment === "Production") || (!sub.livemode && process.env.Environment === "Sandbox")) {
        if(sub.status === "trialing"){
            sub.status = "active"
        }
        return sub; //
    }
    else {
        return null
    }







    // return plan;
}

export default UserSubscriptionResource;