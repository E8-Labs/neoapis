import db from "../models/index.js";
import S3 from "aws-sdk/clients/s3.js";
import JWT from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import multer from "multer";
import path from "path";
import moment from "moment-timezone";
import axios from "axios";
import chalk from "chalk";
import UserProfileFullResource from '../resources/userprofilefullresource.js'
// import nodemailer from 'nodemailer'
// import NotificationType from '../models/user/notificationtype.js'
// import {createThumbnailAndUpload, uploadMedia, deleteFileFromS3} from '../utilities/storage.js'
// import crypto from 'crypto'
// import { fetchOrCreateUserToken } from "./plaid.controller.js";
// const fs = require("fs");
// var Jimp = require("jimp");
// require("dotenv").config();
const User = db.User;
const Op = db.Sequelize.Op;


const SignUser = async (user) =>{
    return new Promise((resolve, reject)=> {
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

        const result = await SignUser(user);
        return res.send({status: true, message: "User registered", data: result})
    }
    else {


        bcrypt.compare(password, user.password, async function (err, result) {
            // result == true
            if (result) {
                const result = await SignUser(user);
                return res.send({status: true, message: "User logged in", data: result})
            }
            else {
                res.send({ status: false, message: "Invalid password", data: null });
            }
        });
    }
}