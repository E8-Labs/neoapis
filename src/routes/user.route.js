import express from 'express'
import { LoginUser, InviteUser, getInvitedUsers, acceptRejectInvitation, UpdateProfile, GetProfile } from '../controllers/user.controller.js'
import verifyJwtToken from '../middleware/jwtmiddleware.js';

import { AddCard, GetUserPaymentSources, subscribeUser, DownloadInvoice, GetTransactions } from '../controllers/paymentController.js';

import { SubscriptionUpdated } from '../services/stripe.js';

import multer from 'multer';

const uploadFiles = multer().fields([
    { name: 'media', maxCount: 1 }
  ]);



let UserRouter = express.Router()


UserRouter.post("/login", LoginUser);
UserRouter.post("/invite_user", verifyJwtToken, InviteUser);
UserRouter.get("/my_team", verifyJwtToken, getInvitedUsers);
UserRouter.post("/handle_invitation", verifyJwtToken, acceptRejectInvitation);
UserRouter.post("/update_profile", verifyJwtToken, uploadFiles, UpdateProfile);
UserRouter.get("/get_profile", verifyJwtToken, GetProfile);



UserRouter.post("/add_card", verifyJwtToken, AddCard);
UserRouter.get("/get_transactions", verifyJwtToken, GetTransactions);
UserRouter.get("/list_cards", verifyJwtToken, GetUserPaymentSources);
UserRouter.post("/subscribe", verifyJwtToken, subscribeUser);
UserRouter.post("/get_invoice", verifyJwtToken, DownloadInvoice);

UserRouter.post("/neo_sub_updated", SubscriptionUpdated);

export default UserRouter
