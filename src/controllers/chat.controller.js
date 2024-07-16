// src/controllers/chatController.js
import db from '../models/index.js';
import { sendMessageToGPT } from '../services/gptService.js';
import JWT from 'jsonwebtoken'

const sendMessage = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      try {
        // const { chatId } = req.params;
        const { content, chatId } = req.body;
        const message = await db.Message.create({ content, senderType: 'user', chatId, userId: authData.user.id, image: null });

        const gptResponse = await sendMessageToGPT(content);
        console.log("Gpt respones ", gptResponse)
        const gptMessage = await db.Message.create({ content: gptResponse, senderType: 'gpt', chatId, image: null });

        res.status(200).json({ data: [message, gptMessage], status: true, message: "message processed" });
      } catch (error) {
        res.status(500).json({ error: 'Server Error', status: false, message: error.message, data: null });
      }
    }
  })

};


export { sendMessage }