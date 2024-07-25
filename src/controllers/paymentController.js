import db from "../models/index.js";
import S3 from "aws-sdk/clients/s3.js";
import JWT from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import multer from "multer";
import path from "path";
import moment from "moment-timezone";
import axios from "axios";
import chalk from "chalk";
import nodemailer from 'nodemailer'
import UserProfileFullResource from '../resources/userprofilefullresource.js'
import TeamResource from "../resources/teamresource.js";
import * as stripe from '../services/stripe.js'

const User = db.User;
const Op = db.Sequelize.Op;

export const AddCard = async (req, res) => {
    console.log("Add card api")
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let user = await db.User.findByPk(authData.user.id);
            let token = req.body.source;
            console.log("User provided Token is ", token)
            let card = await stripe.createCard(user, token);

            res.send({ status: card !== null, message: card !== null ? "Card added" : "Card not added", data: card })
        }
    })
}


export const GetUserPaymentSources = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let user = await db.User.findByPk(authData.user.id);
            let cards = await stripe.loadCards(user);
            //console.log("cards loaded ", cards)
            res.send({ status: true, message: "Card loaded", data: cards })
        }
    })
}

// export const CancelSubscription = async (req, res) => {
//     JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
//         if (authData) {
//             let user = await db.User.findByPk(authData.user.id);
//             let sub = await db.subscriptionModel.findOne({
//                 where: {
//                     UserId: user.id
//                 }
//             })
//             if (sub) {
//                 let cancelled = await cancelSubscription(user, sub);
//                 if (cancelled && cancelled.status) {
//                     sub.data = JSON.stringify(cancelled.data)
//                     let saved = await sub.save();
//                     let s = await UserSubscriptionResource(cancelled.data)
//                     res.send({ status: true, message: "Cancelled", data: s })
//                 }
//                 else {
//                     res.send({ status: false, message: cancelled.message, data: cancelled })
//                 }
//             }
//             else {
//                 res.send({ status: false, message: `${user.name} have no active subs`, data: null })
//             }

//         }
//     })
// }


// export const subscribeUser = async (req, res) => {
//     JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
//         if (authData) {
//             let user = await db.user.findByPk(authData.user.id);

//             //console.log("Getting subs for user ", user)
//             let subs = await GetActiveSubscriptions(user)
//             // subs = subs.data
//             if (subs && subs.data.length !== 0) {
//                 //console.log("User is already subscribed", subs)
//                 let s = await UserSubscriptionResource(subs.data[0])

//                 res.send({ status: false, message: "Already subscribed", data: s })
//             }
//             else {
//                 let cards = await loadCards(user);

//                 if (cards.length === 0) {
//                     res.send({ status: false, message: "no payment source found", data: null })
//                 }
//                 else {
//                     let subtype = req.body.sub_type; //Monthly = 0, HalfYearly = 1, Yearly = 2
//                     let subscription = SubscriptionTypesSandbox[2];
//                     let sandbox = process.env.Environment === "Sandbox";
//                     let code = req.body.code || null;


//                     //console.log("Subscription in Sandbox ", sandbox)
//                     if (sandbox) {
//                         subscription = SubscriptionTypesSandbox[subtype];
//                     }
//                     else {
//                         subscription = SubscriptionTypesProduction[subtype];
//                     }
//                     //console.log("Subscription is ", subscription)

//                     let sub = await createSubscription(user, subscription, code);
//                     if (sub && sub.status) {
//                         let saved = await db.subscriptionModel.create({
//                             subid: sub.data.id,
//                             data: JSON.stringify(sub.data),
//                             UserId: user.id,
//                             environment: process.env.Environment
//                         })
//                         let plan = await UserSubscriptionResource(sub.data)
//                         res.send({ status: true, message: "Subscription", data: plan })
//                     }
//                     else {
//                         res.send({ status: false, message: sub.message, data: sub.data })
//                     }

//                 }
//             }



//         }
//         else {
//             res.send({ status: false, message: "Unauthenticated user", data: null })
//         }
//     })
// }
