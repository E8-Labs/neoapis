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


const SignUser = async (user) => {
    return new Promise((resolve, reject) => {
        JWT.sign({ user }, process.env.SecretJwtKey, { expiresIn: '365d' }, async (err, token) => {
            if (err) {
                reject(err);
            } else {
                let u = await UserProfileFullResource(user);
                resolve({ user: u, token: token });
            }
        });
    })
}
export const LoginUser = async (req, res) => {
    // res.send("Hello Login")
    //////console.log("Login " + req.body.email);
    const email = req.body.email;
    const password = req.body.password;
    let inviteId = req.body.inviteId || null;
    const user = await User.findOne({
        where: {
            email: email
        }
    })

    const count = await User.count();
    //////console.log("Count " + count);
    if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        let user = await db.User.create({
            email: email,
            password: hashed,
        })
        if(inviteId){
            let invite = await db.Invitation.findByPk(inviteId)
            if(invite){
                invite.toUser = user.id;
                invite.status = "accepted";
                let saved = invite.save();
            }
        }
        const result = await SignUser(user);
        let customer = await stripe.createCustomer(user, "loginuser");
        return res.send({ status: true, message: "User registered", data: result })
    }
    else {


        bcrypt.compare(password, user.password, async function (err, result) {
            // result == true
            if (result) {
                const result = await SignUser(user);
                let customer = await stripe.createCustomer(user, "loginuser");
                return res.send({ status: true, message: "User logged in", data: result })
            }
            else {
                res.send({ status: false, message: "Invalid password", data: null });
            }
        });
    }
}


export const acceptRejectInvitation = async(req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userId = authData.user.id
            let user = await db.User.findByPk(userId)
            if(user){
                let status = req.body.status; //accepted, rejected
                let inviteId = req.body.inviteId;
                let invite = await db.Invitation.findByPk(inviteId);
                if(invite){
                    if(invite.toUserEmail == user.email || invite.toUser == user.id){
                        invite.status = status
                    }
                    await invite.save();
                    res.send({ status: true, message: "Invitation accepted", data: null })
                }
                else{
                    res.send({ status: false, message: "Invitation doesn't exist", data: null })
                }

            }
            else{
                res.send({ status: false, message: "No such user", data: null })
            }
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

export const getInvitedUsers = async(req, res)=> {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userId = authData.user.id;
            let user = await db.User.findByPk(userId)
            let teamMembers = await db.Invitation.findAll({
                where: {
                    [Op.or]: [
                        {fromUser: userId},
                        {toUser: userId},
                        {toUserEmail: user.email}
                    ]
                }
            })
            let resource = await TeamResource(teamMembers)
            res.send({ status: true, message: "Team list", data: resource })
        }
        else{
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}

export const InviteUser = async (req, res) => {
    JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
        if (authData) {
            let userId = authData.user.id;
            let user = await db.User.findByPk(userId);
            if (user) {
                let toUserId = req.body.toUserId || null;
                let toUserEmail = req.body.toUserEmail || null;
                let name = req.body.name;
                let role = req.body.role;
                console.log("Email is ", req.body.toUserEmail)
                console.log("Name is ", req.body.name)
                console.log("Role is ", req.body.role)

                if(toUserEmail){
                    let invitedUser = await db.User.findOne({
                        where: {
                            email: toUserEmail
                        }
                    })
                    if(invitedUser){
                        toUserId = invitedUser.id
                    }
                }
                console.log("To User Eamil is ", req.body)
                if (toUserId) { // if the user is on the app already
                    let inv = await db.Invitation.create({
                        fromUser: userId,
                        toUser: toUserId,
                        status: 'pending', 
                        name: name,
                        role: role
                    })
                    res.send({ status: true, message: "Invitation sent", data: inv })
                }
                else {
                    // send email invitation
                    let inv = await db.Invitation.create({
                        fromUser: userId,
                        toUserEmail: toUserEmail,
                        status: 'pending', 
                        name: name,
                        role: role
                    })
                    let sent = await sendEmail(inv.id, user.name ? user.name : user.email, toUserEmail)
                    res.send({ status: true, message: "Invitation sent to mail", data: inv })
                }

            }
            else {
                res.send({ status: false, message: "No such user", data: null })
            }
        }
        else {
            res.send({ status: false, message: "Unauthenticated user", data: null })
        }
    })
}


async function sendEmail(inviteId, fromUserName, toEmail) {


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Replace with your mail server host
        port: 587, // Port number depends on your email provider and whether you're using SSL or not
        secure: false, // true for 465 (SSL), false for other ports
        auth: {
            user: "salman@e8-labs.com", // Your email address
            pass: "uzmvwsljflyqnzgu", // Your email password
        },
    });
    
    try {
        let mailOptions = {
            from: '"Neo Ai" salman@e8-labs.com', // Sender address
            to: toEmail, // List of recipients
            subject: "Invitation", // Subject line
            // text: `${randomCode}`, // Plain text body
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #6050DC;
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
        }
        .content .code {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            background-color: #6050DC;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #777777;
        }
        .footer a {
            color: #007BFF;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Join Our Team (${fromUserName})!</h1>
        </div>
        <div class="content">
            <p><strong>Hello there!</strong></p>
            <p>You have been invited to join our team on Neo AI!</p>
            <p>We would love to have you as part of our team and work together to achieve great things. Your presence and contributions will be highly valued.</p>
            <p>To join our team, please click the link below:</p>
            <p><a href="https://neoai-ebon.vercel.app/auth/login?inviteId=${inviteId}" style="display: inline-block; margin: 20px 0; padding: 10px 20px; font-size: 16px; color: white; background-color: #6050DC; border-radius: 4px; text-decoration: none;">Join Our Team</a></p>
        </div>
        <div class="footer">
            <p>If you have any questions, please <a href="mailto:salman@e8-labs.com">contact us</a>.</p>
        </div>
    </div>
</body>
</html>
`
            , 
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return { status: false, message: "Code not sent" }
                ////console.log(error);
            }
            else {
                return { status: true, message: "Code sent" }
            }
        });
    }
    catch (error) {
        return {status: false, message: "An error occurred", error: error}
        //console.log("Exception email", error)
    }

}