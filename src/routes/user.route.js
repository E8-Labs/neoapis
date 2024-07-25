import express from 'express'
import { LoginUser, InviteUser, getInvitedUsers, acceptRejectInvitation } from '../controllers/user.controller.js'
import verifyJwtToken from '../middleware/jwtmiddleware.js';

import { AddCard, GetUserPaymentSources } from '../controllers/paymentController.js';



let UserRouter = express.Router()


UserRouter.post("/login", LoginUser);
UserRouter.post("/invite_user", verifyJwtToken, InviteUser);
UserRouter.get("/my_team", verifyJwtToken, getInvitedUsers);
UserRouter.post("/handle_invitation", verifyJwtToken, acceptRejectInvitation);



UserRouter.post("/add_card", verifyJwtToken, AddCard);
UserRouter.get("/list_cards", verifyJwtToken, GetUserPaymentSources);

export default UserRouter
